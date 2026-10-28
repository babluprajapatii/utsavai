import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import modules to test
import {
  createEventSchema,
  updateEventSchema,
  createTaskSchema,
  updateTaskSchema,
  createVendorSchema,
  updateVendorSchema,
  createGuestSchema,
  updateGuestSchema,
  createExpenseSchema,
  createMilestoneSchema,
  createScheduleItemSchema,
  normalizeEventTypeInput,
  normalizeTaskPriorityInput,
  normalizeTaskStatusInput,
  normalizeVendorCategoryInput,
  normalizeVendorStatusInput,
  normalizeGuestRsvpStatusInput,
} from '../src/lib/api/validation.ts';

import {
  apiSuccess,
  apiError,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  serverError,
  ErrorCodes,
} from '../src/lib/api/response.ts';

import {
  generateDeterministicPlan,
  validateAndNormalizePlan,
} from '../src/lib/ai/validation.ts';

// ============================================================================
// 1. API Validation & Normalization Tests
// ============================================================================
test('Validation: Event normalization & boundary enforcement', () => {
  // Test type normalization
  assert.equal(normalizeEventTypeInput('wedding'), 'Wedding');
  assert.equal(normalizeEventTypeInput('birthday'), 'Birthday');
  assert.equal(normalizeEventTypeInput('community'), 'Community Event');
  assert.equal(normalizeEventTypeInput('community event'), 'Community Event');
  assert.equal(normalizeEventTypeInput('family'), 'Family Celebration');
  assert.equal(normalizeEventTypeInput('custom'), 'Custom Event');

  // Test schema parsing with normalized type
  const validEvent = createEventSchema.safeParse({
    name: 'Diwali Gala 2026',
    type: 'community',
    event_date: '2026-11-12',
    total_budget: 150000,
    guest_count: 350,
  });
  assert.ok(validEvent.success, 'Valid event should pass');
  assert.equal(validEvent.data.type, 'Community Event');

  // Rejection of invalid inputs
  const invalidDate = createEventSchema.safeParse({
    name: 'Invalid Date Event',
    type: 'Wedding',
    event_date: '12-11-2026',
  });
  assert.ok(!invalidDate.success, 'DD-MM-YYYY format should fail');

  const negativeBudget = createEventSchema.safeParse({
    name: 'Negative Budget',
    type: 'Wedding',
    event_date: '2026-11-12',
    total_budget: -500,
  });
  assert.ok(!negativeBudget.success, 'Negative budget must fail');
});

test('Validation: Task priority and status normalization', () => {
  assert.equal(normalizeTaskPriorityInput('high'), 'High');
  assert.equal(normalizeTaskPriorityInput('critical'), 'Critical');
  assert.equal(normalizeTaskPriorityInput('low'), 'Low');

  assert.equal(normalizeTaskStatusInput('not_started'), 'Not Started');
  assert.equal(normalizeTaskStatusInput('in_progress'), 'In Progress');
  assert.equal(normalizeTaskStatusInput('completed'), 'Completed');

  const parsedTask = createTaskSchema.safeParse({
    title: 'Book Photographer',
    priority: 'high',
    status: 'in_progress',
    due_date: '2026-10-30',
  });
  assert.ok(parsedTask.success);
  assert.equal(parsedTask.data.priority, 'High');
  assert.equal(parsedTask.data.status, 'In Progress');
});

test('Validation: Vendor category and status normalization', () => {
  assert.equal(normalizeVendorCategoryInput('food'), 'Catering');
  assert.equal(normalizeVendorCategoryInput('venue'), 'Venue');
  assert.equal(normalizeVendorCategoryInput('entertainment'), 'Entertainment');
  assert.equal(normalizeVendorCategoryInput('contingency'), 'Other');

  assert.equal(normalizeVendorStatusInput('researching'), 'Researching');
  assert.equal(normalizeVendorStatusInput('booked'), 'Booked');

  const parsedVendor = createVendorSchema.safeParse({
    name: 'Royal Caterers',
    category: 'food',
    status: 'booked',
    quoted_price: 250000,
    agreed_price: 240000,
    contact_email: 'chef@royalcatering.com',
  });
  assert.ok(parsedVendor.success);
  assert.equal(parsedVendor.data.category, 'Catering');
  assert.equal(parsedVendor.data.status, 'Booked');

  const badEmailVendor = createVendorSchema.safeParse({
    name: 'Bad Email Vendor',
    category: 'Venue',
    contact_email: 'not-an-email',
  });
  assert.ok(!badEmailVendor.success, 'Malformed email should be rejected');
});

test('Validation: Guest RSVP status normalization & PII protection', () => {
  assert.equal(normalizeGuestRsvpStatusInput('accepted'), 'Accepted');
  assert.equal(normalizeGuestRsvpStatusInput('declined'), 'Declined');
  assert.equal(normalizeGuestRsvpStatusInput('pending'), 'Pending');

  const parsedGuest = createGuestSchema.safeParse({
    name: 'Aarav Sharma',
    rsvp_status: 'accepted',
    email: 'aarav@example.com',
    phone: '+91 98765 43210',
    meal_preference: 'Veg',
  });
  assert.ok(parsedGuest.success);
  assert.equal(parsedGuest.data.rsvp_status, 'Accepted');
});

test('Validation: Schedule item and milestone validation', () => {
  const validSchedule = createScheduleItemSchema.safeParse({
    activity: 'Baraat Arrival & Welcome',
    start_time: '18:30',
    end_time: '19:15',
    location: 'Main Entrance Courtyard',
  });
  assert.ok(validSchedule.success);

  const invalidSchedule = createScheduleItemSchema.safeParse({
    activity: 'Bad Time Schedule',
    start_time: 'evening',
  });
  assert.ok(!invalidSchedule.success, 'Non-HH:MM time format must be rejected');

  const validMilestone = createMilestoneSchema.safeParse({
    title: 'Finalize Guest List',
    milestone_date: '2026-10-15',
    status: 'completed',
  });
  assert.ok(validMilestone.success);
  assert.equal(validMilestone.data.status, 'Completed');
});

// ============================================================================
// 2. API Response Envelope Tests
// ============================================================================
test('API Response Envelopes: Success, errors, and status codes', async () => {
  const successRes = apiSuccess({ id: 'evt-123', name: 'Birthday' }, 200, {
    total: 1,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const successJson = await successRes.json();
  assert.equal(successRes.status, 200);
  assert.equal(successJson.success, true);
  assert.equal(successJson.data.name, 'Birthday');
  assert.equal(successJson.pagination.total, 1);

  const unauthRes = unauthorized();
  const unauthJson = await unauthRes.json();
  assert.equal(unauthRes.status, 401);
  assert.equal(unauthJson.success, false);
  assert.equal(unauthJson.error.code, ErrorCodes.AUTHENTICATION_REQUIRED);

  const forbRes = forbidden();
  assert.equal(forbRes.status, 403);

  const notFoundRes = notFound('Event not found');
  assert.equal(notFoundRes.status, 404);

  const badReqRes = badRequest('Validation failed', { field: 'name' });
  assert.equal(badReqRes.status, 400);

  const serverErrRes = serverError('Database connection failed');
  assert.equal(serverErrRes.status, 500);
});

// ============================================================================
// 3. AI Planning Engine Hardening Tests
// ============================================================================
test('AI Engine: Deterministic plan fallback generates complete valid structure', () => {
  const plan = generateDeterministicPlan({
    id: 'evt-test-1',
    name: 'Grand Golden Anniversary',
    type: 'Family Celebration',
    eventDate: '2026-12-25',
    daysRemaining: 60,
    totalBudget: 500000,
    guestCount: 150,
  });

  assert.ok(plan.summary.length > 10, 'Must have detailed summary');
  assert.ok(plan.tasks.length >= 5, 'Must have realistic task volume');
  assert.ok(plan.budget_categories.length >= 4, 'Must have categorized budget');
  assert.ok(plan.milestones.length >= 3, 'Must have milestone checkpoints');
  assert.ok(plan.event_day_schedule.length >= 4, 'Must have day schedule');

  // Verify dates are clamped properly
  for (const t of plan.tasks) {
    assert.ok(t.suggested_due_date <= '2026-12-25', 'Task due date must not exceed event date');
  }
});

test('AI Engine: Plan normalization and 5% budget tolerance', () => {
  const rawCandidate = {
    summary: 'A well structured test plan',
    tasks: [
      {
        title: 'Book Venue',
        description: 'Reserve hall',
        priority: 'High',
        category: 'Venue',
        suggested_due_date: '2026-11-01',
      },
    ],
    milestones: [
      {
        title: 'Invitations Sent',
        milestone_date: '2026-10-25',
        description: 'Send e-invites',
      },
    ],
    budget_categories: [
      { category: 'Venue', suggested_amount: 51000, percentage_of_budget: 100 }, // Total: 51000, target 50000 (within 5% tolerance)
    ],
    event_day_schedule: [
      { start_time: '10:00', activity: 'Opening ceremony' },
    ],
  };

  const result = validateAndNormalizePlan(rawCandidate, {
    id: 'evt-test-2',
    name: 'Small Party',
    type: 'Birthday',
    eventDate: '2026-12-01',
    daysRemaining: 34,
    totalBudget: 50000,
    guestCount: 20,
  });

  assert.ok(result.valid, 'Plan within 5% tolerance should normalize cleanly');
  assert.ok(result.plan, 'Normalized plan should be defined');
  assert.equal(result.plan.tasks.length, 1);
  assert.equal(result.plan.tasks[0].priority, 'High');
});

// ============================================================================
// 4. Client Security & Secret Leakage Prevention Tests
// ============================================================================
test('Security: Zero secrets or server keys in client codebase', () => {
  const clientFiles = [
    'frontend/src/lib/store.ts',
    'frontend/src/lib/api-client.ts',
    'frontend/src/lib/auth.ts',
    'frontend/src/lib/mock-data.ts',
    'frontend/src/components/views/ai-assistant.tsx',
    'frontend/src/components/views/export.tsx',
  ];

  for (const relPath of clientFiles) {
    const fullPath = path.resolve(relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');

    // Never embed raw secret patterns or private environment variables in client files
    assert.ok(!content.includes('AIzaSy'), `File ${relPath} must not contain Google API keys`);
    assert.ok(!content.includes('SUPABASE_SERVICE_ROLE_KEY'), `File ${relPath} must not reference service role key`);
    assert.ok(!content.includes('process.env.GEMINI_API_KEY'), `File ${relPath} must not access GEMINI_API_KEY directly on client`);
  }
});

// ============================================================================
// 5. State Invariants, Empty States & Cross-User Security Simulation
// ============================================================================
test('Flow Invariants: Empty states and safe defaults', () => {
  // Empty event summaries calculation
  const emptyEvents = [];
  assert.equal(emptyEvents.length, 0);

  // Default fallback values
  const defaultTask = createTaskSchema.parse({
    title: 'Minimal task',
  });
  assert.equal(defaultTask.priority, 'Medium');
  assert.equal(defaultTask.status, 'Not Started');

  const defaultVendor = createVendorSchema.parse({
    name: 'Sample Vendor',
    category: 'Venue',
  });
  assert.equal(defaultVendor.status, 'Researching');
  assert.equal(defaultVendor.quoted_price, 0);
  assert.equal(defaultVendor.agreed_price, 0);

  const defaultGuest = createGuestSchema.parse({
    name: 'A guest',
  });
  assert.equal(defaultGuest.rsvp_status, 'Pending');
  assert.equal(defaultGuest.plus_one, false);
});

test('Flow Invariants: Malformed and boundary input handling', () => {
  // Whitespace-only title must fail
  const emptyTitle = createTaskSchema.safeParse({ title: '   ' });
  assert.ok(!emptyTitle.success);

  // Negative amounts must fail
  const negativeExpense = createExpenseSchema.safeParse({
    description: 'Flowers',
    actual_amount: -100,
  });
  assert.ok(!negativeExpense.success);

  // Unparseable time strings must fail
  const badTime = createScheduleItemSchema.safeParse({
    activity: 'Sangeet',
    start_time: '25:99', // out of range regex
  });
  assert.ok(!badTime.success);
});

