import { z } from 'zod';

export const eventTypes = [
  'Wedding',
  'Birthday',
  'Community Event',
  'Family Celebration',
  'Custom Event',
] as const;

export const eventStatuses = ['Planning', 'Active', 'Completed', 'Cancelled'] as const;

export const taskPriorities = ['Low', 'Medium', 'High', 'Critical'] as const;

export const taskStatuses = ['Not Started', 'In Progress', 'Completed'] as const;

export const milestoneStatuses = ['Pending', 'Completed', 'Overdue'] as const;

export const vendorCategories = [
  'Venue',
  'Catering',
  'Photography',
  'Decoration',
  'Music',
  'Transportation',
  'Security',
  'Entertainment',
  'Other',
] as const;

export const vendorStatuses = [
  'Researching',
  'Shortlisted',
  'Contacted',
  'Negotiating',
  'Booked',
  'Completed',
  'Cancelled',
] as const;

export const guestRsvpStatuses = ['Pending', 'Accepted', 'Declined'] as const;

export function normalizeEventTypeInput(val: unknown): string {
  if (typeof val !== 'string') return String(val ?? '');
  const lower = val.trim().toLowerCase();
  if (lower === 'wedding') return 'Wedding';
  if (lower === 'birthday') return 'Birthday';
  if (lower === 'community' || lower === 'community event') return 'Community Event';
  if (lower === 'family' || lower === 'family celebration') return 'Family Celebration';
  if (lower === 'custom' || lower === 'custom event') return 'Custom Event';
  return val;
}

export function normalizeEventStatusInput(val: unknown): string {
  if (typeof val !== 'string') return String(val ?? '');
  const lower = val.trim().toLowerCase();
  if (lower === 'planning') return 'Planning';
  if (lower === 'active') return 'Active';
  if (lower === 'completed') return 'Completed';
  if (lower === 'cancelled') return 'Cancelled';
  return val;
}

export function normalizeTaskPriorityInput(val: unknown): string {
  if (typeof val !== 'string') return String(val ?? '');
  const lower = val.trim().toLowerCase();
  if (lower === 'low') return 'Low';
  if (lower === 'medium') return 'Medium';
  if (lower === 'high') return 'High';
  if (lower === 'critical') return 'Critical';
  return val;
}

export function normalizeTaskStatusInput(val: unknown): string {
  if (typeof val !== 'string') return String(val ?? '');
  const lower = val.trim().toLowerCase().replace(/[-_\s]+/g, ' ');
  if (lower === 'not started') return 'Not Started';
  if (lower === 'in progress') return 'In Progress';
  if (lower === 'completed') return 'Completed';
  return val;
}

export function normalizeMilestoneStatusInput(val: unknown): string {
  if (typeof val !== 'string') return String(val ?? '');
  const lower = val.trim().toLowerCase();
  if (lower === 'pending') return 'Pending';
  if (lower === 'completed') return 'Completed';
  if (lower === 'overdue') return 'Overdue';
  return val;
}

export function normalizeVendorCategoryInput(val: unknown): string {
  if (typeof val !== 'string') return String(val ?? '');
  const lower = val.trim().toLowerCase();
  if (lower === 'venue') return 'Venue';
  if (lower === 'catering' || lower === 'food') return 'Catering';
  if (lower === 'photography') return 'Photography';
  if (lower === 'decoration') return 'Decoration';
  if (lower === 'music') return 'Music';
  if (lower === 'transportation') return 'Transportation';
  if (lower === 'security') return 'Security';
  if (lower === 'entertainment') return 'Entertainment';
  if (lower === 'other' || lower === 'contingency') return 'Other';
  return val;
}

export function normalizeVendorStatusInput(val: unknown): string {
  if (typeof val !== 'string') return String(val ?? '');
  const lower = val.trim().toLowerCase();
  if (lower === 'researching') return 'Researching';
  if (lower === 'shortlisted') return 'Shortlisted';
  if (lower === 'contacted') return 'Contacted';
  if (lower === 'negotiating') return 'Negotiating';
  if (lower === 'booked') return 'Booked';
  if (lower === 'completed') return 'Completed';
  if (lower === 'cancelled') return 'Cancelled';
  return val;
}

export function normalizeGuestRsvpStatusInput(val: unknown): string {
  if (typeof val !== 'string') return String(val ?? '');
  const lower = val.trim().toLowerCase();
  if (lower === 'pending') return 'Pending';
  if (lower === 'accepted') return 'Accepted';
  if (lower === 'declined') return 'Declined';
  return val;
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

// ============================================================================
// Events Schemas
// ============================================================================
export const createEventSchema = z.object({
  name: z.string().trim().min(1, 'Event name is required').max(200),
  type: z.preprocess(normalizeEventTypeInput, z.enum(eventTypes)),
  event_date: z.string().regex(dateRegex, 'Event date must be in YYYY-MM-DD format'),
  start_time: z.string().regex(timeRegex, 'Start time must be HH:MM or HH:MM:SS').nullable().optional(),
  end_time: z.string().regex(timeRegex, 'End time must be HH:MM or HH:MM:SS').nullable().optional(),
  location: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  guest_count: z.number().int().min(0, 'Guest count cannot be negative').nullable().optional(),
  total_budget: z.number().min(0, 'Budget cannot be negative').nullable().optional(),
  currency: z.string().trim().max(10).default('INR').optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.preprocess(normalizeEventStatusInput, z.enum(eventStatuses)).optional(),
});

// ============================================================================
// Preferences Schemas
// ============================================================================
export const eventPreferencesSchema = z.object({
  theme: z.string().trim().max(200).nullable().optional(),
  style: z.string().trim().max(200).nullable().optional(),
  priorities: z.any().optional(),
  special_requirements: z.string().trim().max(2000).nullable().optional(),
});

// ============================================================================
// Budget Categories Schemas
// ============================================================================
export const createBudgetCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  planned_amount: z.number().min(0, 'Planned amount must be non-negative').default(0).optional(),
});

export const updateBudgetCategorySchema = createBudgetCategorySchema.partial();

// ============================================================================
// Expenses Schemas
// ============================================================================
export const createExpenseSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1, 'Description is required').max(500),
  planned_amount: z.number().min(0).default(0).optional(),
  actual_amount: z.number().min(0, 'Actual amount must be non-negative'),
  expense_date: z.string().regex(dateRegex).default(() => new Date().toISOString().split('T')[0]).optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// ============================================================================
// Tasks Schemas
// ============================================================================
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  description: z.string().trim().max(1000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  priority: z.preprocess(normalizeTaskPriorityInput, z.enum(taskPriorities)).default('Medium').optional(),
  status: z.preprocess(normalizeTaskStatusInput, z.enum(taskStatuses)).default('Not Started').optional(),
  due_date: z.string().regex(dateRegex).nullable().optional(),
  assigned_to: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// ============================================================================
// Task Dependencies Schemas
// ============================================================================
export const createDependencySchema = z.object({
  depends_on_task_id: z.string().uuid('Valid prerequisite task ID required'),
});

// ============================================================================
// Milestones Schemas
// ============================================================================
export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  milestone_date: z.string().regex(dateRegex, 'Milestone date must be YYYY-MM-DD'),
  description: z.string().trim().max(1000).nullable().optional(),
  status: z.preprocess(normalizeMilestoneStatusInput, z.enum(milestoneStatuses)).default('Pending').optional(),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

// ============================================================================
// Schedule Items Schemas
// ============================================================================
export const createScheduleItemSchema = z.object({
  activity: z.string().trim().min(1, 'Activity is required').max(300),
  start_time: z.string().regex(timeRegex, 'Start time must be HH:MM or HH:MM:SS'),
  end_time: z.string().regex(timeRegex).nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  responsible_person: z.string().trim().max(200).nullable().optional(),
  responsible_vendor_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).default(0).optional(),
});

export const updateScheduleItemSchema = createScheduleItemSchema.partial();

// ============================================================================
// Vendors Schemas
// ============================================================================
export const createVendorSchema = z.object({
  name: z.string().trim().min(1, 'Vendor name is required').max(200),
  category: z.preprocess(normalizeVendorCategoryInput, z.enum(vendorCategories)),
  contact_name: z.string().trim().max(200).nullable().optional(),
  contact_phone: z.string().trim().max(50).nullable().optional(),
  contact_email: z.string().trim().email().max(255).nullable().optional(),
  website: z.string().trim().max(500).nullable().optional(),
  quoted_price: z.number().min(0).default(0).optional(),
  agreed_price: z.number().min(0).default(0).optional(),
  status: z.preprocess(normalizeVendorStatusInput, z.enum(vendorStatuses)).default('Researching').optional(),
  booking_date: z.string().regex(dateRegex).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

// ============================================================================
// Guests Schemas
// ============================================================================
export const createGuestSchema = z.object({
  name: z.string().trim().min(1, 'Guest name is required').max(200),
  group_name: z.string().trim().max(100).nullable().optional(),
  email: z.string().trim().email().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  rsvp_status: z.preprocess(normalizeGuestRsvpStatusInput, z.enum(guestRsvpStatuses)).default('Pending').optional(),
  plus_one: z.boolean().default(false).optional(),
  meal_preference: z.string().trim().max(100).nullable().optional(),
  special_requirements: z.string().trim().max(1000).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

// ============================================================================
// Notifications Schemas
// ============================================================================
export const updateNotificationSchema = z.object({
  is_read: z.boolean().optional(),
  read: z.boolean().optional(),
}).refine(data => data.is_read !== undefined || data.read !== undefined, {
  message: 'Must provide read or is_read boolean',
});

// ============================================================================
// AI Schemas
// ============================================================================
export const generatePlanSchema = z.object({
  event_id: z.string().uuid('Valid event UUID required'),
});

export const acceptPlanSchema = z.object({
  event_id: z.string().uuid('Valid event UUID required'),
  tasks: z.array(z.any()).optional(),
  milestones: z.array(z.any()).optional(),
  eventDaySchedule: z.array(z.any()).optional(),
});

export const aiChatSchema = z.object({
  event_id: z.string().uuid('Valid event UUID required'),
  message: z.string().trim().min(1, 'Message is required').max(2000),
});

// ============================================================================
// Pagination Query Schema
// ============================================================================
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

