import test from 'node:test';
import assert from 'node:assert/strict';

import { serverError, apiError, ErrorCodes } from '../src/lib/api/response.ts';
import {
  acceptPlanSchema,
  acceptedPlanTaskSchema,
  acceptedPlanMilestoneSchema,
  acceptedPlanScheduleItemSchema,
} from '../src/lib/api/validation.ts';
import {
  checkRateLimit,
  getRateLimitConfigDiagnostics,
  isSharedRateLimiterConfigured,
  getRateLimitHeaders,
} from '../src/lib/api/rate-limit.ts';
import nextConfig from '../next.config.ts';

// ============================================================================
// 1. Production Error Sanitization Tests
// ============================================================================
test('Security: serverError sanitizes detailed error messages in production', async () => {
  const originalEnv = process.env.NODE_ENV;

  try {
    // 1. In production, details must be omitted from client response JSON
    process.env.NODE_ENV = 'production';
    const prodRes = serverError('Database query failed', {
      query: 'SELECT * FROM internal_users WHERE id = 1',
      postgresCode: '42P01',
    });
    const prodJson = await prodRes.json();

    assert.equal(prodRes.status, 500);
    assert.equal(prodJson.success, false);
    assert.equal(prodJson.error.code, ErrorCodes.INTERNAL_ERROR);
    assert.equal(prodJson.error.message, 'Database query failed');
    assert.equal(
      prodJson.error.details,
      undefined,
      'Internal database query or stack trace must not be sent to client in production'
    );

    // 2. In development, details should be preserved for debugging
    process.env.NODE_ENV = 'development';
    const devRes = serverError('Local debug error', { debugHint: 'check connection' });
    const devJson = await devRes.json();

    assert.equal(devRes.status, 500);
    assert.deepEqual(devJson.error.details, { debugHint: 'check connection' });
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

// ============================================================================
// 2. Rate Limiting Tests
// ============================================================================
test('Security: Rate limiting diagnostics and threshold throttling', async () => {
  const diagnostics = getRateLimitConfigDiagnostics();
  assert.ok(typeof diagnostics.configured === 'boolean');
  assert.ok(['upstash_redis', 'local_fallback_unshared'].includes(diagnostics.store));

  // In test environment without Upstash credentials, local store simulates rate limiting
  const testId = `test-user-${Date.now()}`;
  const options = { maxRequests: 2, windowSeconds: 10 };

  const req1 = await checkRateLimit(testId, options);
  assert.equal(req1.allowed, true);
  assert.equal(req1.remaining, 1);

  const req2 = await checkRateLimit(testId, options);
  assert.equal(req2.allowed, true);
  assert.equal(req2.remaining, 0);

  const req3 = await checkRateLimit(testId, options);
  assert.equal(req3.allowed, false, 'Third request must be blocked under 2 req limit');
  assert.equal(req3.remaining, 0);
  assert.ok(req3.resetInSeconds > 0);
});

// ============================================================================
// 3. Plan Acceptance Payload Validation Tests
// ============================================================================
test('Security: Accepted plan items schema validation and boundaries', () => {
  // Valid task
  const validTask = acceptedPlanTaskSchema.safeParse({
    title: 'Book Mandap Decorator',
    description: 'Discuss flower arrangement and lighting',
    category: 'Decoration',
    priority: 'high',
    due_date: '2026-11-20',
  });
  assert.ok(validTask.success);
  assert.equal(validTask.data.priority, 'High');

  // Task with empty title must fail
  const emptyTitleTask = acceptedPlanTaskSchema.safeParse({
    title: '',
  });
  assert.ok(!emptyTitleTask.success);

  // Task with title exceeding 300 characters must fail
  const hugeTitleTask = acceptedPlanTaskSchema.safeParse({
    title: 'A'.repeat(301),
  });
  assert.ok(!hugeTitleTask.success);

  // Valid schedule item
  const validSchedule = acceptedPlanScheduleItemSchema.safeParse({
    activity: 'Ganesh Puja',
    start_time: '10:00',
    end_time: '11:00',
  });
  assert.ok(validSchedule.success);

  // Invalid schedule time format must fail
  const invalidTimeSchedule = acceptedPlanScheduleItemSchema.safeParse({
    activity: 'Lunch',
    start_time: 'noon',
  });
  assert.ok(!invalidTimeSchedule.success);

  // Comprehensive acceptPlanSchema validation
  const validPlanPayload = acceptPlanSchema.safeParse({
    event_id: '11111111-1111-4111-a111-111111111111',
    tasks: [
      { title: 'Confirm photographer', priority: 'Medium' },
    ],
    milestones: [
      { title: 'Venue advance paid', milestone_date: '2026-10-01' },
    ],
    eventDaySchedule: [
      { activity: 'Guest Welcome', start_time: '09:30' },
    ],
  });
  assert.ok(validPlanPayload.success);

  // Invalid event UUID must fail
  const invalidUuidPayload = acceptPlanSchema.safeParse({
    event_id: 'not-a-valid-uuid',
  });
  assert.ok(!invalidUuidPayload.success);
});

// ============================================================================
// 4. Global HTTP Security Headers Tests
// ============================================================================
test('Security: next.config.ts configures mandatory HTTP security headers', async () => {
  assert.ok(typeof nextConfig.headers === 'function');
  const headersConfig = await nextConfig.headers();

  const globalRule = headersConfig.find(h => h.source === '/:path*');
  assert.ok(globalRule, 'Global security headers rule must exist for /:path*');

  const headerMap = new Map(globalRule.headers.map(h => [h.key, h.value]));

  // Verify OWASP recommended baseline headers
  assert.equal(headerMap.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(headerMap.get('X-Frame-Options'), 'DENY');
  assert.equal(headerMap.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.ok(headerMap.get('Permissions-Policy')?.includes('camera=()'));
  assert.ok(headerMap.get('Permissions-Policy')?.includes('microphone=()'));
  assert.ok(headerMap.get('Permissions-Policy')?.includes('geolocation=()'));

  // Verify enforced CSP configuration
  const csp = headerMap.get('Content-Security-Policy');
  assert.ok(csp, 'Enforced Content-Security-Policy must be present');
  assert.ok(csp.includes("default-src 'self'"));
  assert.ok(csp.includes("https://*.supabase.co"));
  assert.ok(csp.includes("frame-ancestors 'none'"));
  assert.ok(csp.includes("base-uri 'self'"));
  assert.ok(csp.includes("object-src 'none'"));
  assert.ok(!csp.includes("'unsafe-eval'"), "Enforced CSP must not include 'unsafe-eval'");
});

// ============================================================================
// 5. Standard Rate Limiting Headers Tests
// ============================================================================
test('Security: Standard RateLimit-Limit, RateLimit-Remaining, and RateLimit-Reset headers', () => {
  const allowedResult = {
    allowed: true,
    limit: 20,
    remaining: 19,
    resetInSeconds: 58,
    isSharedStore: true,
  };
  const allowedHeaders = getRateLimitHeaders(allowedResult);
  assert.equal(allowedHeaders['RateLimit-Limit'], '20');
  assert.equal(allowedHeaders['RateLimit-Remaining'], '19');
  assert.equal(allowedHeaders['RateLimit-Reset'], '58');
  assert.equal(allowedHeaders['Retry-After'], undefined);

  const blockedResult = {
    allowed: false,
    limit: 20,
    remaining: 0,
    resetInSeconds: 45,
    isSharedStore: true,
  };
  const blockedHeaders = getRateLimitHeaders(blockedResult);
  assert.equal(blockedHeaders['RateLimit-Limit'], '20');
  assert.equal(blockedHeaders['RateLimit-Remaining'], '0');
  assert.equal(blockedHeaders['RateLimit-Reset'], '45');
  assert.equal(blockedHeaders['Retry-After'], '45');
});

