import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string | null;
}

/**
 * Checks whether Supabase credentials are configured and non-placeholder.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigError() === null;
}

/**
 * Returns a specific, actionable configuration error message if Supabase credentials
 * are missing, placeholder, or invalid. Returns null if properly configured.
 */
export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  const missing: string[] = [];
  if (!url || url.includes('placeholder-project') || url.includes('your-project-ref')) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (
    !key ||
    key === 'placeholder-anon-key' ||
    key === 'your-supabase-anon-key' ||
    key.length < 20
  ) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missing.length > 0) {
    return `Authentication service is not configured. Missing or placeholder environment variable(s): ${missing.join(', ')}. Please configure valid credentials in .env.local or Vercel project settings.`;
  }

  try {
    const parsed = new URL(url!);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Authentication service is not configured: NEXT_PUBLIC_SUPABASE_URL must be a valid http(s) URL.';
    }
  } catch {
    return 'Authentication service is not configured: NEXT_PUBLIC_SUPABASE_URL is not a valid URL format.';
  }

  return null;
}

/**
 * Register a new user using Supabase Auth email and password.
 * Full name is passed in options.data so the PostgreSQL database trigger
 * `on_auth_user_created` can automatically provision public.profiles.
 */
export async function signUpUser(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  const normalizedEmail = email?.trim() || '';
  const trimmedName = fullName?.trim() || '';

  if (!trimmedName || !normalizedEmail || !password) {
    return {
      success: false,
      error: 'Full name, email, and password are required.',
    };
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return {
      success: false,
      error: configError,
    };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
      },
    });

    if (error) {
      return { success: false, error: formatAuthError(error) };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Registration failed. No user was returned by authentication service.',
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Sign in existing user using email and password.
 * Establishes a session stored in browser cookies via @supabase/ssr.
 */
export async function signInUser(
  email: string,
  password: string
): Promise<AuthResult> {
  const normalizedEmail = email?.trim() || '';
  if (!normalizedEmail || !password) {
    return {
      success: false,
      error: 'Please enter both email and password.',
    };
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return {
      success: false,
      error: configError,
    };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return { success: false, error: formatAuthError(error) };
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        error: 'Authentication failed. No active session established.',
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Sign in using Google OAuth via Supabase Auth.
 */
export async function signInWithGoogle(): Promise<{ error?: string }> {
  const configError = getSupabaseConfigError();
  if (configError) {
    return {
      error: configError,
    };
  }

  try {
    const supabase = createClient();
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      return { error: formatAuthError(error) };
    }

    return {};
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Failed to initiate Google sign in.';
    return { error: errorMsg };
  }
}

/**
 * Sign out the currently authenticated user and invalidate session cookies.
 */
export async function signOutUser(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return {};
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Failed to sign out.';
    return { error: errorMsg };
  }
}

/**
 * Retrieves the currently authenticated user from the local session/cookie.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

/**
 * Subscribes to Supabase Auth state changes (signed in, signed out, token refreshed).
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  } catch {
    return null;
  }
}

/**
 * Translates Supabase Auth errors into user-friendly messages.
 */
function formatAuthError(error: AuthError): string {
  const msg = error.message.toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (msg.includes('user already registered')) {
    return 'An account with this email already exists. Please log in instead.';
  }
  if (msg.includes('password should be at least')) {
    return 'Password is too weak. Please use at least 8 characters.';
  }
  if (msg.includes('rate limit')) {
    return 'Too many login attempts. Please wait a moment and try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please check your email and confirm your account before logging in.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Unable to reach the authentication server. Please check your network connection.';
  }
  return error.message;
}

