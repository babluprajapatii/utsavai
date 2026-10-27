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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes('placeholder-project') &&
      key !== 'placeholder-anon-key'
  );
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
  // If running in development with unconfigured placeholder credentials,
  // allow demo signup so frontend workflow can be tested without breaking
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        app_metadata: {},
        user_metadata: { full_name: fullName.trim() },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      return {
        success: true,
        user: mockUser,
        session: null,
      };
    }
    return {
      success: false,
      error:
        'Supabase is not configured with live credentials. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.',
    };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      return { success: false, error: formatAuthError(error) };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'An unexpected error occurred.';
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
  // If running in development with unconfigured placeholder credentials,
  // allow demo sign-in so frontend workflow can be tested without breaking
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      const mockUser: User = {
        id: 'usr_dev_' + Math.random().toString(36).substring(2, 9),
        email,
        app_metadata: {},
        user_metadata: { full_name: email.split('@')[0] || 'User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      return {
        success: true,
        user: mockUser,
        session: null,
      };
    }
    return {
      success: false,
      error:
        'Supabase is not configured with live credentials. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.',
    };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: formatAuthError(error) };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'An unexpected error occurred.';
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
  if (!isSupabaseConfigured()) {
    return {
      error:
        'Google OAuth requires configured Supabase credentials. Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.',
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

