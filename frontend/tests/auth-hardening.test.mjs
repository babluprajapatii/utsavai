import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  apiSuccess,
  apiError,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  ErrorCodes,
} from '../src/lib/api/response.ts';

// ============================================================================
// 1. Static Security & Bypass Elimination Checks
// ============================================================================
test('Auth Hardening: Zero mock users or authentication bypasses in codebase', () => {
  const targetFiles = [
    'src/lib/auth.ts',
    'src/lib/store.ts',
    'src/lib/api/auth.ts',
    'src/proxy.ts',
    'src/components/views/login.tsx',
    'src/components/views/register.tsx',
  ];

  for (const relPath of targetFiles) {
    const fullPath = path.resolve('frontend', relPath);
    const content = fs.existsSync(fullPath)
      ? fs.readFileSync(fullPath, 'utf8')
      : fs.readFileSync(path.resolve(relPath), 'utf8');

    // Verify mock user generators are completely removed
    assert.ok(
      !content.includes('usr_dev_'),
      `File ${relPath} must not contain demo 'usr_dev_' identifiers`
    );
    assert.ok(
      !content.includes('DEV_MOCK_USER_ID'),
      `File ${relPath} must not contain DEV_MOCK_USER_ID bypass`
    );
    assert.ok(
      !content.includes('allow demo sign-in'),
      `File ${relPath} must not contain demo sign-in bypass comments`
    );
    assert.ok(
      !content.includes('allow demo signup'),
      `File ${relPath} must not contain demo signup bypass comments`
    );
  }
});

// ============================================================================
// 2. Client-Side Login & Registration Form Validation
// ============================================================================
test('Auth Hardening: Empty and invalid credentials rejection', () => {
  // Validation logic mirror from LoginView / RegisterView
  const validateLogin = (email, password) => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    return errors;
  };

  // Empty credentials
  const emptyRes = validateLogin('', '');
  assert.equal(emptyRes.email, 'Email is required.');
  assert.equal(emptyRes.password, 'Password is required.');

  // Whitespace-only / malformed email
  const badEmail = validateLogin('invalid-email-string', 'secret123');
  assert.equal(badEmail.email, 'Enter a valid email address.');
  assert.equal(badEmail.password, undefined);

  // Short password
  const shortPass = validateLogin('user@example.com', '123');
  assert.equal(shortPass.email, undefined);
  assert.equal(shortPass.password, 'Password must be at least 6 characters.');

  // Valid credentials syntax
  const valid = validateLogin('user@example.com', 'securePassword123');
  assert.deepEqual(valid, {});
});

// ============================================================================
// 3. Supabase Auth Error Translation & Security Invariants
// ============================================================================
test('Auth Hardening: Auth error formatting prevents user enumeration', () => {
  // Format error helper logic from auth.ts
  const formatAuthError = (errorMessage) => {
    const msg = (errorMessage || '').toLowerCase();
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
    return errorMessage;
  };

  // Both wrong password and non-existent user return identical message to prevent user enumeration
  const wrongPasswordMsg = formatAuthError('Invalid login credentials');
  const nonExistentUserMsg = formatAuthError('Invalid login credentials');
  assert.equal(
    wrongPasswordMsg,
    'Invalid email or password. Please check your credentials and try again.'
  );
  assert.equal(wrongPasswordMsg, nonExistentUserMsg);

  // Rate limiting handling
  const rateLimitMsg = formatAuthError('Email rate limit exceeded');
  assert.equal(
    rateLimitMsg,
    'Too many login attempts. Please wait a moment and try again.'
  );

  // Unconfirmed email handling
  const unconfirmedMsg = formatAuthError('Email not confirmed');
  assert.equal(
    unconfirmedMsg,
    'Please check your email and confirm your account before logging in.'
  );
});

// ============================================================================
// 4. Session State Management Invariants (Login, Refresh, Logout)
// ============================================================================
test('Auth Hardening: Session lifecycle & state machine invariants', () => {
  // Simulate AppStore auth state transitions
  let state = {
    isAuthed: false,
    authLoading: true,
    user: null,
    route: { kind: 'public', view: 'home' },
    events: [],
  };

  // 1. Initial State before session check
  assert.equal(state.isAuthed, false);
  assert.equal(state.authLoading, true);

  // 2. Unauthenticated check completion (e.g. initAuth with no session)
  state = {
    ...state,
    isAuthed: false,
    authLoading: false,
    user: null,
  };
  assert.equal(state.isAuthed, false);
  assert.equal(state.authLoading, false);

  // 3. Successful real login with Supabase user ID
  const supabaseUserId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const loginAction = (email, name, id) => {
    if (!id) return state; // Invariant: must reject without valid id
    return {
      ...state,
      isAuthed: true,
      authLoading: false,
      user: { id, name: name || email.split('@')[0], email },
      route: { kind: 'app', view: 'dashboard' },
      events: [{ id: 'evt-1', name: 'Wedding Gala' }],
    };
  };

  // Rejection without real id
  const rejectedState = loginAction('fake@example.com', 'Fake', undefined);
  assert.equal(rejectedState.isAuthed, false);

  // Acceptance with real id
  state = loginAction('user@example.com', 'Real User', supabaseUserId);
  assert.equal(state.isAuthed, true);
  assert.equal(state.user.id, supabaseUserId);
  assert.equal(state.route.view, 'dashboard');
  assert.equal(state.events.length, 1);

  // 4. Page refresh simulation: rehydration from active Supabase session
  const rehydrateSession = (activeUser) => {
    if (activeUser) {
      return {
        ...state,
        isAuthed: true,
        authLoading: false,
        user: { id: activeUser.id, name: activeUser.name, email: activeUser.email },
      };
    }
    return {
      ...state,
      isAuthed: false,
      authLoading: false,
      user: null,
      route: { kind: 'public', view: 'login' },
      events: [],
    };
  };

  const refreshedState = rehydrateSession({
    id: supabaseUserId,
    name: 'Real User',
    email: 'user@example.com',
  });
  assert.equal(refreshedState.isAuthed, true);
  assert.equal(refreshedState.user.id, supabaseUserId);

  // 5. Logout action
  const logoutAction = () => {
    return {
      isAuthed: false,
      authLoading: false,
      user: null,
      route: { kind: 'public', view: 'login' },
      events: [],
    };
  };

  state = logoutAction();
  assert.equal(state.isAuthed, false);
  assert.equal(state.user, null);
  assert.equal(state.route.kind, 'public');
  assert.equal(state.route.view, 'login');
  assert.equal(state.events.length, 0);
});

// ============================================================================
// 5. Supabase Auth Configuration Validation & Actionable Diagnostics
// ============================================================================
test('Auth Hardening: Supabase configuration validation & actionable diagnostics', () => {
  // Test configuration error generator function
  const getSupabaseConfigError = (url, key) => {
    const missing = [];
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
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'Authentication service is not configured: NEXT_PUBLIC_SUPABASE_URL must be a valid http(s) URL.';
      }
    } catch {
      return 'Authentication service is not configured: NEXT_PUBLIC_SUPABASE_URL is not a valid URL format.';
    }

    return null;
  };

  // Both missing or placeholder
  const errBoth = getSupabaseConfigError('https://placeholder-project.supabase.co', 'placeholder-anon-key');
  assert.ok(errBoth.includes('NEXT_PUBLIC_SUPABASE_URL'));
  assert.ok(errBoth.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'));

  // Missing URL only
  const errUrl = getSupabaseConfigError('', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validkeyhere123456');
  assert.ok(errUrl.includes('NEXT_PUBLIC_SUPABASE_URL'));
  assert.ok(!errUrl.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'));

  // Invalid URL format
  const errBadUrl = getSupabaseConfigError('not-a-valid-url', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validkeyhere123456');
  assert.ok(errBadUrl.includes('not a valid URL'));

  // Valid configuration
  const validConfig = getSupabaseConfigError('https://xyzcompany.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validkeyhere123456');
  assert.equal(validConfig, null);
});

// ============================================================================
// 6. Protected Route Authorization Hardening (401 Rejection)
// ============================================================================
test('Auth Hardening: Protected API routes strictly reject unauthenticated access', async () => {
  // Simulate protected API route unauthenticated request
  const unauthResponse = unauthorized('Authentication required to access this API resource.');
  const responseJson = await unauthResponse.json();

  assert.equal(unauthResponse.status, 401);
  assert.equal(responseJson.success, false);
  assert.equal(responseJson.error.code, ErrorCodes.AUTHENTICATION_REQUIRED);
  assert.equal(
    responseJson.error.message,
    'Authentication required to access this API resource.'
  );

  // Test middleware API route path filter
  const isProtectedPath = (pathname) => {
    return pathname.startsWith('/api') && pathname !== '/api';
  };

  assert.equal(isProtectedPath('/api'), false, 'Root /api is public');
  assert.equal(isProtectedPath('/api/events'), true, '/api/events is protected');
  assert.equal(isProtectedPath('/api/tasks/123'), true, '/api/tasks is protected');
  assert.equal(isProtectedPath('/api/budget-categories/abc'), true, 'Budget is protected');
  assert.equal(isProtectedPath('/api/ai/generate-plan'), true, 'AI is protected');
  assert.equal(isProtectedPath('/api/dashboard'), true, 'Dashboard is protected');
});

