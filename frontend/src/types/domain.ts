/**
 * UtsavAI - Core Domain Types & UI Metadata
 * Single source of truth for application domain entities, enums, models, and domain metadata.
 */

export type EventType =
  | "wedding"
  | "birthday"
  | "community"
  | "family"
  | "custom";

export type TaskStatus = "not_started" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export type VendorStatus =
  | "researching"
  | "shortlisted"
  | "contacted"
  | "negotiating"
  | "booked"
  | "completed"
  | "cancelled";

export type RsvpStatus = "pending" | "accepted" | "declined";

export type BudgetCategory =
  | "venue"
  | "food"
  | "decoration"
  | "photography"
  | "entertainment"
  | "transportation"
  | "contingency";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO date YYYY-MM-DD
  category: BudgetCategory | "planning" | "logistics";
  owner?: string;
  dependsOn?: string[];
  eventId: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: BudgetCategory;
  contactName?: string;
  phone?: string;
  email?: string;
  estimatedCost: number;
  actualCost?: number;
  status: VendorStatus;
  bookingDate?: string;
  notes?: string;
  eventId: string;
}

export interface Guest {
  id: string;
  name: string;
  group?: string;
  phone?: string;
  email?: string;
  rsvp: RsvpStatus;
  mealPreference?: "veg" | "non-veg" | "jain" | "vegan";
  specialRequirements?: string;
  notes?: string;
  plusOnes?: number;
  eventId: string;
}

export interface Expense {
  id: string;
  category: BudgetCategory;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  date: string;
  notes?: string;
  eventId: string;
}

export interface BudgetCategoryPlan {
  category: BudgetCategory;
  planned: number;
  spent: number;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  description?: string;
  completed: boolean;
  eventId: string;
}

export interface ScheduleItem {
  id: string;
  time: string; // HH:MM
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  status: "scheduled" | "in_progress" | "completed" | "delayed";
  owner?: string;
  eventId: string;
}

export interface AppNotification {
  id: string;
  type:
    | "task_overdue"
    | "deadline_approaching"
    | "budget_warning"
    | "vendor_warning"
    | "guest_reminder"
    | "ai_plan_generated"
    | "task_completed";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventId?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

export interface CelebrationEvent {
  id: string;
  name: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  expectedGuests: number;
  totalBudget: number;
  currency: string;
  theme?: string;
  style?: string;
  priorities: string[];
  specialRequirements?: string;
  coverColor?: string;
  createdAt: string;
}

export const eventTypeMeta: Record<
  EventType,
  { label: string; description: string; tagline: string }
> = {
  wedding: {
    label: "Wedding",
    description: "Ceremonies, receptions, and all the moments in between.",
    tagline: "Every ritual, every detail, one plan.",
  },
  birthday: {
    label: "Birthday",
    description: "Milestone birthdays, kids parties, and surprise celebrations.",
    tagline: "Make their day unforgettable.",
  },
  community: {
    label: "Community Event",
    description: "Society gatherings, cultural programmes, and reunions.",
    tagline: "Bring people together.",
  },
  family: {
    label: "Family Celebration",
    description: "Anniversaries, festivals, and intimate family occasions.",
    tagline: "Cherish the moments that matter.",
  },
  custom: {
    label: "Custom Event",
    description: "Anything worth celebrating. Build a plan from scratch.",
    tagline: "Your occasion, your way.",
  },
};

export const categoryMeta: Record<
  BudgetCategory,
  { label: string; color: string; description: string }
> = {
  venue: {
    label: "Venue",
    color: "oklch(0.55 0.14 35)",
    description: "Hall, lawn, or home setup",
  },
  food: {
    label: "Food",
    color: "oklch(0.65 0.12 70)",
    description: "Catering, cake, and beverages",
  },
  decoration: {
    label: "Decoration",
    color: "oklch(0.50 0.10 150)",
    description: "Flowers, stage, and props",
  },
  photography: {
    label: "Photography",
    color: "oklch(0.60 0.10 220)",
    description: "Photo and video coverage",
  },
  entertainment: {
    label: "Entertainment",
    color: "oklch(0.45 0.10 320)",
    description: "Music, DJ, performances",
  },
  transportation: {
    label: "Transportation",
    color: "oklch(0.55 0.08 200)",
    description: "Guest and vendor transport",
  },
  contingency: {
    label: "Contingency",
    color: "oklch(0.55 0.05 60)",
    description: "Buffer for unexpected costs",
  },
};

export const taskStatusMeta: Record<
  TaskStatus,
  { label: string; color: string; dot: string }
> = {
  not_started: {
    label: "Not Started",
    color: "oklch(0.65 0.01 70)",
    dot: "bg-muted-foreground/40",
  },
  in_progress: {
    label: "In Progress",
    color: "oklch(0.65 0.13 70)",
    dot: "bg-warning",
  },
  completed: {
    label: "Completed",
    color: "oklch(0.55 0.12 150)",
    dot: "bg-success",
  },
};

export const priorityMeta: Record<
  TaskPriority,
  { label: string; color: string }
> = {
  low: { label: "Low", color: "oklch(0.65 0.01 70)" },
  medium: { label: "Medium", color: "oklch(0.55 0.08 220)" },
  high: { label: "High", color: "oklch(0.65 0.13 70)" },
  critical: { label: "Critical", color: "oklch(0.55 0.18 25)" },
};

export const vendorStatusMeta: Record<
  VendorStatus,
  { label: string; color: string }
> = {
  researching: { label: "Researching", color: "oklch(0.65 0.01 70)" },
  shortlisted: { label: "Shortlisted", color: "oklch(0.55 0.08 220)" },
  contacted: { label: "Contacted", color: "oklch(0.65 0.13 70)" },
  negotiating: { label: "Negotiating", color: "oklch(0.70 0.13 40)" },
  booked: { label: "Booked", color: "oklch(0.55 0.12 150)" },
  completed: { label: "Completed", color: "oklch(0.45 0.05 150)" },
  cancelled: { label: "Cancelled", color: "oklch(0.55 0.18 25)" },
};

export const rsvpMeta: Record<
  RsvpStatus,
  { label: string; color: string; dot: string }
> = {
  pending: { label: "Pending", color: "oklch(0.65 0.01 70)", dot: "bg-muted-foreground/40" },
  accepted: { label: "Accepted", color: "oklch(0.55 0.12 150)", dot: "bg-success" },
  declined: { label: "Declined", color: "oklch(0.55 0.18 25)", dot: "bg-destructive" },
};

export function getEventById(events: CelebrationEvent[], id: string) {
  return events.find((e) => e.id === id);
}

export function tasksForEvent(tasks: Task[], eventId: string) {
  return tasks.filter((t) => t.eventId === eventId);
}

export function vendorsForEvent(vendors: Vendor[], eventId: string) {
  return vendors.filter((v) => v.eventId === eventId);
}

export function guestsForEvent(guests: Guest[], eventId: string) {
  return guests.filter((g) => g.eventId === eventId);
}

export function expensesForEvent(expenses: Expense[], eventId: string) {
  return expenses.filter((e) => e.eventId === eventId);
}

export function timelineForEvent(
  milestones: TimelineMilestone[],
  eventId: string
) {
  return milestones
    .filter((m) => m.eventId === eventId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function scheduleForEvent(
  schedule: ScheduleItem[],
  eventId: string
) {
  return schedule
    .filter((s) => s.eventId === eventId)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function notificationsForEvent(
  notifications: AppNotification[],
  eventId?: string
) {
  if (!eventId) return notifications;
  return notifications.filter((n) => n.eventId === eventId);
}
