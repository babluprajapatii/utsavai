import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Resolves whether the incoming request Origin is trusted.
 * Restricts cross-origin access strictly to production domain, preview deployments,
 * and localhost (development only). Never uses wildcard (*).
 */
function resolveAllowedOrigin(origin: string | null, requestUrl: string): string | null {
  if (!origin) return null;

  try {
    const url = new URL(requestUrl);
    const selfOrigin = `${url.protocol}//${url.host}`;
    if (origin === selfOrigin) return origin;

    const allowedOrigins = [
      'https://utsavai-ten.vercel.app',
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`
        : null,
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`
        : null,
    ].filter(Boolean) as string[];

    for (const allowed of allowedOrigins) {
      try {
        if (new URL(allowed).origin === origin) {
          return origin;
        }
      } catch {
        // Skip malformed environment URL
      }
    }

    // Allow loopback origins for local development and testing only
    if (process.env.NODE_ENV !== 'production') {
      const parsed = new URL(origin);
      if (
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
        (parsed.protocol === 'http:' || parsed.protocol === 'https:')
      ) {
        return origin;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function applyCorsHeaders(response: NextResponse, allowedOrigin: string | null): NextResponse {
  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }
  return response;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api');
  const isProtectedApi = isApiRoute && pathname !== '/api';

  const origin = request.headers.get('origin');
  const allowedOrigin = isApiRoute ? resolveAllowedOrigin(origin, request.url) : null;

  // 1. Handle CORS preflight for API routes
  if (isApiRoute && request.method === 'OPTIONS') {
    if (origin && !allowedOrigin) {
      return new NextResponse(null, { status: 403 });
    }
    const preflightHeaders = new Headers();
    if (allowedOrigin) {
      preflightHeaders.set('Access-Control-Allow-Origin', allowedOrigin);
      preflightHeaders.set('Access-Control-Allow-Credentials', 'true');
      preflightHeaders.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      preflightHeaders.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, Origin'
      );
      preflightHeaders.set('Access-Control-Max-Age', '86400');
      preflightHeaders.set('Vary', 'Origin');
    }
    return new NextResponse(null, { status: 204, headers: preflightHeaders });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  // If Supabase environment variables are missing or unconfigured placeholders, reject protected APIs
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('placeholder-project') ||
    supabaseAnonKey === 'placeholder-anon-key'
  ) {
    if (isProtectedApi) {
      return applyCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Authentication required to access this API resource.',
            },
          },
          { status: 401 }
        ),
        allowedOrigin
      );
    }
    return applyCorsHeaders(supabaseResponse, allowedOrigin);
  }

  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Calling getUser() refreshes the session token in cookies if expired.
    // Do not run code between createServerClient and supabase.auth.getUser().
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Route Protection: API routes require authenticated session
    if (isProtectedApi && !user) {
      return applyCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Authentication required to access this API resource.',
            },
          },
          { status: 401 }
        ),
        allowedOrigin
      );
    }
  } catch (error) {
    if (isProtectedApi) {
      return applyCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Authentication required to access this API resource.',
            },
          },
          { status: 401 }
        ),
        allowedOrigin
      );
    }
    console.error('Supabase proxy auth refresh error:', error);
  }

  return applyCorsHeaders(supabaseResponse, allowedOrigin);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static media extensions (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

