import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  checkRateLimit,
  getRateLimitConfigDiagnostics,
  isSharedRateLimiterConfigured,
} from '../src/lib/api/rate-limit.ts';

import {
  normalizeEventTypeInput,
  normalizeEventStatusInput,
  normalizeTaskPriorityInput,
  normalizeTaskStatusInput,
  normalizeMilestoneStatusInput,
  normalizeVendorCategoryInput,
  normalizeVendorStatusInput,
  normalizeGuestRsvpStatusInput,
} from '../src/lib/api/validation.ts';

import { apiSuccess, apiError, serverError, ErrorCodes } from '../src/lib/api/response.ts';

// ============================================================================
// 1. Rate Limiting Threshold Behavior Tests
// ============================================================================
test('Rate limiting: blocks requests exceeding threshold', async () => {
  const testId = `rate-test-${Date.now()}`;
  const options = { maxRequests: 3, windowSeconds: 60 };

  const r1 = await checkRateLimit(testId, options);
  assert.equal(r1.allowed, true);
  assert.equal(r1.limit, 3);
  assert.equal(r1.remaining, 2);

  const r2 = await checkRateLimit(testId, options);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = await checkRateLimit(testId, options);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);

  const r4 = await checkRateLimit(testId, options);
  assert.equal(r4.allowed, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.resetInSeconds > 0);
});

test('Rate limiting: resets after window expiry', async () => {
  const testId = `rate-reset-${Date.now()}`;
  const options = { maxRequests: 1, windowSeconds: 1 };

  const r1 = await checkRateLimit(testId, options);
  assert.equal(r1.allowed, true);

  const r2 = await checkRateLimit(testId, options);
  assert.equal(r2.allowed, false);
});

test('Rate limiting diagnostics structure', () => {
  const diag = getRateLimitConfigDiagnostics();
  assert.ok(typeof diag.configured === 'boolean');
  assert.ok(['upstash_redis', 'local_fallback_unshared'].includes(diag.store));
  assert.ok(Array.isArray(diag.missingEnv));
  assert.ok(diag.missingEnv.includes('UPSTASH_REDIS_REST_URL'));
  assert.ok(diag.missingEnv.includes('UPSTASH_REDIS_REST_TOKEN'));
});

test('Shared rate limiter not configured in dev', () => {
  assert.equal(isSharedRateLimiterConfigured(), false);
});

// ============================================================================
// 2. Input Normalization Tests
// ============================================================================
test('Validation: Event type normalization', () => {
  assert.equal(normalizeEventTypeInput('wedding'), 'Wedding');
  assert.equal(normalizeEventTypeInput('birthday'), 'Birthday');
  assert.equal(normalizeEventTypeInput('community'), 'Community Event');
  assert.equal(normalizeEventTypeInput('community event'), 'Community Event');
  assert.equal(normalizeEventTypeInput('family'), 'Family Celebration');
  assert.equal(normalizeEventTypeInput('family celebration'), 'Family Celebration');
  assert.equal(normalizeEventTypeInput('custom'), 'Custom Event');
  assert.equal(normalizeEventTypeInput('custom event'), 'Custom Event');

  // Unknown input passes through unchanged
  assert.equal(normalizeEventTypeInput('Unknown'), 'Unknown');
});

test('Validation: Event status normalization', () => {
  assert.equal(normalizeEventStatusInput('planning'), 'Planning');
  assert.equal(normalizeEventStatusInput('active'), 'Active');
  assert.equal(normalizeEventStatusInput('completed'), 'Completed');
  assert.equal(normalizeEventStatusInput('cancelled'), 'Cancelled');
  assert.equal(normalizeEventStatusInput('CANCELLED'), 'Cancelled');
});

test('Validation: Task priority normalization', () => {
  assert.equal(normalizeTaskPriorityInput('low'), 'Low');
  assert.equal(normalizeTaskPriorityInput('medium'), 'Medium');
  assert.equal(normalizeTaskPriorityInput('high'), 'High');
  assert.equal(normalizeTaskPriorityInput('critical'), 'Critical');
});

test('Validation: Task status normalization', () => {
  assert.equal(normalizeTaskStatusInput('not_started'), 'Not Started');
  assert.equal(normalizeTaskStatusInput('in_progress'), 'In Progress');
  assert.equal(normalizeTaskStatusInput('completed'), 'Completed');
  assert.equal(normalizeTaskStatusInput('not started'), 'Not Started');
  assert.equal(normalizeTaskStatusInput('in-progress'), 'In Progress');
});

test('Validation: Vendor category normalization', () => {
  assert.equal(normalizeVendorCategoryInput('venue'), 'Venue');
  assert.equal(normalizeVendorCategoryInput('catering'), 'Catering');
  assert.equal(normalizeVendorCategoryInput('food'), 'Catering');
  assert.equal(normalizeVendorCategoryInput('photography'), 'Photography');
  assert.equal(normalizeVendorCategoryInput('decoration'), 'Decoration');
  assert.equal(normalizeVendorCategoryInput('music'), 'Music');
  assert.equal(normalizeVendorCategoryInput('transportation'), 'Transportation');
  assert.equal(normalizeVendorCategoryInput('security'), 'Security');
  assert.equal(normalizeVendorCategoryInput('entertainment'), 'Entertainment');
  assert.equal(normalizeVendorCategoryInput('other'), 'Other');
  assert.equal(normalizeVendorCategoryInput('contingency'), 'Other');
});

test('Validation: Vendor status normalization', () => {
  assert.equal(normalizeVendorStatusInput('researching'), 'Researching');
  assert.equal(normalizeVendorStatusInput('shortlisted'), 'Shortlisted');
  assert.equal(normalizeVendorStatusInput('contacted'), 'Contacted');
  assert.equal(normalizeVendorStatusInput('negotiating'), 'Negotiating');
  assert.equal(normalizeVendorStatusInput('booked'), 'Booked');
  assert.equal(normalizeVendorStatusInput('completed'), 'Completed');
  assert.equal(normalizeVendorStatusInput('cancelled'), 'Cancelled');
});

test('Validation: Guest RSVP status normalization', () => {
  assert.equal(normalizeGuestRsvpStatusInput('pending'), 'Pending');
  assert.equal(normalizeGuestRsvpStatusInput('accepted'), 'Accepted');
  assert.equal(normalizeGuestRsvpStatusInput('declined'), 'Declined');
});

// ============================================================================
// 3. API Response Envelope Tests
// ============================================================================
test('API response: apiSuccess creates valid envelope', async () => {
  const res = apiSuccess({ id: 'evt-123', name: 'Birthday' }, 200, {
    total: 1,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.name, 'Birthday');
  assert.equal(json.pagination.total, 1);
  assert.equal(json.pagination.hasMore, false);
});

test('API response: apiError creates valid error envelope', async () => {
  const res = apiError('VALIDATION_ERROR', 'Field is required', 400, { field: 'email' });
  const json = await res.json();

  assert.equal(res.status, 400);
  assert.equal(json.success, false);
  assert.equal(json.error.code, 'VALIDATION_ERROR');
  assert.equal(json.error.message, 'Field is required');
  assert.deepEqual(json.error.details, { field: 'email' });
});

test('API response: serverError sanitizes details in production', async () => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    const res = serverError('Database connection failed', { query: 'SELECT * FROM users' });
    const json = await res.json();

    assert.equal(res.status, 500);
    assert.equal(json.success, false);
    assert.equal(json.error.code, ErrorCodes.INTERNAL_ERROR);
    assert.equal(json.error.message, 'Database connection failed');
    assert.equal(json.error.details, undefined);
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

test('API response: apiSuccess default status is 200', async () => {
  const res = apiSuccess({ ok: true });
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.ok, true);
});
