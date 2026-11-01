import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateBudgetSummary,
  calculateCategoryBudget,
} from '../src/lib/calculations/budget.ts';

import {
  detectDependencyCycle,
  validatePrerequisiteReferences,
} from '../src/lib/calculations/tasks.ts';

import {
  calculateGuestMetrics,
} from '../src/lib/calculations/guests.ts';

import {
  generateICS,
} from '../src/lib/ics.ts';

import {
  dateFnsFormat,
} from '../src/lib/date-utils.ts';

// ============================================================================
// 1. Budget Calculation Tests (docs/15 Section 4.1)
// ============================================================================

test('calc-01: Normal budget spend', () => {
  const result = calculateBudgetSummary(500000, [{ actualAmount: 250000 }]);
  assert.equal(result.totalBudget, 500000);
  assert.equal(result.totalSpent, 250000);
  assert.equal(result.remaining, 250000);
  assert.equal(result.utilization, 50.0);
  assert.equal(result.status, 'normal');
  assert.equal(result.isOverBudget, false);
});

test('calc-02: Zero budget allocated (division-by-zero protection)', () => {
  const result = calculateBudgetSummary(0, []);
  assert.equal(result.totalBudget, 0);
  assert.equal(result.totalSpent, 0);
  assert.equal(result.remaining, 0);
  assert.equal(result.utilization, 0.0);
  assert.equal(result.status, 'normal');
  assert.equal(result.isOverBudget, false);
});

test('calc-03: Zero expenses recorded', () => {
  const result = calculateBudgetSummary(1000000, 0);
  assert.equal(result.totalBudget, 1000000);
  assert.equal(result.totalSpent, 0);
  assert.equal(result.remaining, 1000000);
  assert.equal(result.utilization, 0.0);
  assert.equal(result.status, 'normal');
  assert.equal(result.isOverBudget, false);
});

test('calc-04: Exactly 80% threshold (status = warning)', () => {
  const result = calculateBudgetSummary(100000, 80000);
  assert.equal(result.remaining, 20000);
  assert.equal(result.utilization, 80.0);
  assert.equal(result.status, 'warning');
  assert.equal(result.isOverBudget, false);
});

test('calc-05: Exactly 90% threshold (status = critical)', () => {
  const result = calculateBudgetSummary(100000, 90000);
  assert.equal(result.remaining, 10000);
  assert.equal(result.utilization, 90.0);
  assert.equal(result.status, 'critical');
  assert.equal(result.isOverBudget, false);
});

test('calc-06: Exactly 100% budget spend', () => {
  const result = calculateBudgetSummary(200000, 200000);
  assert.equal(result.remaining, 0);
  assert.equal(result.utilization, 100.0);
  assert.equal(result.status, 'critical');
  assert.equal(result.isOverBudget, false);
});

test('calc-07: Over-budget deficit spend', () => {
  const result = calculateBudgetSummary(100000, 115000);
  assert.equal(result.remaining, -15000);
  assert.equal(result.utilization, 115.0);
  assert.equal(result.status, 'over_budget');
  assert.equal(result.isOverBudget, true);
});

test('calc-08: Category budget breakdown and utilization', () => {
  const result = calculateCategoryBudget(50000, [
    { actualAmount: 15000 },
    { actualAmount: 20000 },
  ]);
  assert.equal(result.planned, 50000);
  assert.equal(result.spent, 35000);
  assert.equal(result.remaining, 15000);
  assert.equal(result.utilization, 70.0);
  assert.equal(result.isOverBudget, false);
});

// ============================================================================
// 2. Task Dependency DAG Cycle Detection Tests (docs/15 Section 4.2)
// ============================================================================

test('task-01: Valid linear dependency DAG: A -> B -> C', () => {
  const edges = [
    { taskId: 'task-A', dependsOnTaskId: 'task-B' },
    { taskId: 'task-B', dependsOnTaskId: 'task-C' },
  ];
  const result = detectDependencyCycle(edges);
  assert.equal(result.hasCycle, false);
});

test('task-02: Direct circular dependency: A -> B -> A', () => {
  const edges = [
    { taskId: 'task-A', dependsOnTaskId: 'task-B' },
  ];
  const result = detectDependencyCycle(edges, {
    taskId: 'task-B',
    dependsOnTaskId: 'task-A',
  });
  assert.equal(result.hasCycle, true);
  assert.ok(result.cyclePath.includes('task-A') && result.cyclePath.includes('task-B'));
});

test('task-03: Self-referential task dependency: A -> A', () => {
  const result = detectDependencyCycle([], {
    taskId: 'task-A',
    dependsOnTaskId: 'task-A',
  });
  assert.equal(result.hasCycle, true);
  assert.deepEqual(result.cyclePath, ['task-A', 'task-A']);
});

test('task-04: Multi-node circular dependency: A -> B -> C -> D -> B', () => {
  const edges = [
    { taskId: 'task-B', dependsOnTaskId: 'task-C' },
    { taskId: 'task-C', dependsOnTaskId: 'task-D' },
  ];
  const result = detectDependencyCycle(edges, {
    taskId: 'task-D',
    dependsOnTaskId: 'task-B',
  });
  assert.equal(result.hasCycle, true);
  assert.ok(result.reason.includes('Circular dependency detected'));
});

test('task-05: Disconnected DAG with parallel tracks: A -> B, C -> D', () => {
  const edges = [
    { taskId: 'task-A', dependsOnTaskId: 'task-B' },
    { taskId: 'task-C', dependsOnTaskId: 'task-D' },
  ];
  const result = detectDependencyCycle(edges);
  assert.equal(result.hasCycle, false);
});

test('task-06: Prerequisite reference validator identifies missing tasks', () => {
  const edges = [
    { taskId: 'task-A', dependsOnTaskId: 'task-B' },
    { taskId: 'task-B', dependsOnTaskId: 'task-nonexistent' },
  ];
  const knownTasks = ['task-A', 'task-B'];
  const result = validatePrerequisiteReferences(edges, knownTasks);
  assert.equal(result.isValid, false);
  assert.deepEqual(result.missing, ['task-nonexistent']);
});

// ============================================================================
// 3. Guest RSVP & Headcount Aggregator Tests (docs/15 Section 4.3)
// ============================================================================

test('guest-01: Standard guest list RSVP aggregation', () => {
  const guests = [
    { id: 'g1', rsvp: 'accepted', plusOnes: 1, mealPreference: 'veg' },
    { id: 'g2', rsvp: 'accepted', plusOnes: 0, mealPreference: 'non-veg' },
    { id: 'g3', rsvp: 'declined', plusOnes: 2, mealPreference: 'veg' },
    { id: 'g4', rsvp: 'pending', plusOnes: 1, mealPreference: 'jain' },
  ];

  const metrics = calculateGuestMetrics(guests);
  assert.equal(metrics.totalInvited, 4);
  assert.equal(metrics.acceptedCount, 2);
  assert.equal(metrics.declinedCount, 1);
  assert.equal(metrics.pendingCount, 1);
  assert.equal(metrics.plusOnesTotal, 1); // Only accepted plus-ones count toward attending
  assert.equal(metrics.totalAttending, 3); // 2 accepted guests + 1 plus-one
});

test('guest-02: Meal preference splits across dietary options', () => {
  const guests = [
    { id: 'g1', rsvp: 'accepted', mealPreference: 'veg' },
    { id: 'g2', rsvp: 'accepted', mealPreference: 'vegetarian' },
    { id: 'g3', rsvp: 'accepted', mealPreference: 'non-veg' },
    { id: 'g4', rsvp: 'accepted', mealPreference: 'jain' },
    { id: 'g5', rsvp: 'accepted', mealPreference: 'vegan' },
  ];

  const metrics = calculateGuestMetrics(guests);
  assert.equal(metrics.mealBreakdown.veg, 2);
  assert.equal(metrics.mealBreakdown.nonVeg, 1);
  assert.equal(metrics.mealBreakdown.jain, 1);
  assert.equal(metrics.mealBreakdown.vegan, 1);
});

// ============================================================================
// 4. RFC 5545 iCalendar (.ics) Generation Tests
// ============================================================================

test('ics-01: Generates valid RFC 5545 calendar syntax and CRLF breaks', () => {
  const ics = generateICS(
    {
      id: 'evt-diwali-2026',
      name: 'Diwali Grand Celebration',
      description: 'Festival of Lights annual gathering',
      location: 'Community Hall, Sector 14',
      date: '2026-11-08',
      startTime: '18:00',
      endTime: '22:00',
    },
    [
      {
        id: 'ms-diyas',
        title: 'Light Diyas & Rangoli',
        date: '2026-11-08',
      },
    ]
  );

  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR'));
  assert.ok(ics.includes('VERSION:2.0\r\n'));
  assert.ok(ics.includes('PRODID:-//UtsavAI//Celebration Event Planning Platform//EN\r\n'));
  assert.ok(ics.includes('BEGIN:VEVENT\r\n'));
  assert.ok(ics.includes('SUMMARY:Diwali Grand Celebration\r\n'));
  assert.ok(ics.includes('LOCATION:Community Hall\\, Sector 14\r\n'));
  assert.ok(ics.includes('UID:evt-diwali-2026-main@utsavai.com\r\n'));
  assert.ok(ics.includes('STATUS:CONFIRMED\r\n'));
});

// ============================================================================
// 5. Date Utility Token Replacement Tests
// ============================================================================

test('date-01: dateFnsFormat handles full and short formatting tokens', () => {
  const d = new Date(2026, 11, 15, 14, 30); // Dec 15, 2026 14:30
  const formattedLong = dateFnsFormat(d, 'd MMMM yyyy');
  assert.equal(formattedLong, '15 December 2026');

  const formattedShort = dateFnsFormat(d, 'd MMM yyyy');
  assert.equal(formattedShort, '15 Dec 2026');

  const formattedIso = dateFnsFormat(d, 'yyyy-MM-dd');
  assert.equal(formattedIso, '2026-12-15');
});
