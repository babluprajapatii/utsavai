// Mock data for UtsavAI - clearly demo data, not real business metrics.
// All currency in INR.

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
  dueDate: string; // ISO date
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

// ───────────────────────────────────────────────────────────────────────────
// Demo event: Wedding Celebration
// ───────────────────────────────────────────────────────────────────────────

const weddingEventId = "evt_wedding_001";

export const demoEvents: CelebrationEvent[] = [
  {
    id: weddingEventId,
    name: "Wedding Celebration",
    type: "wedding",
    date: "2026-12-15",
    startTime: "10:00",
    endTime: "22:00",
    location: "The Tamarind Hall, Bengaluru",
    expectedGuests: 220,
    totalBudget: 500000,
    currency: "INR",
    theme: "Ivory & Marigold",
    style: "Traditional with modern touches",
    priorities: ["Venue", "Catering", "Photography", "Guest experience"],
    specialRequirements: "Jain meals for 30 guests, wheelchair access for elderly",
    coverColor: "oklch(0.55 0.14 35)",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "evt_birthday_001",
    name: "Aarav's 7th Birthday",
    type: "birthday",
    date: "2026-11-22",
    startTime: "16:00",
    endTime: "20:00",
    location: "Garden Lawn, Jayanagar",
    expectedGuests: 35,
    totalBudget: 75000,
    currency: "INR",
    theme: "Jungle Adventure",
    style: "Playful, kid-friendly",
    priorities: ["Cake", "Activities", "Return gifts"],
    coverColor: "oklch(0.65 0.12 150)",
    createdAt: "2026-10-15T11:30:00Z",
  },
  {
    id: "evt_community_001",
    name: "Diwali Society Get-Together",
    type: "community",
    date: "2026-11-08",
    startTime: "18:00",
    endTime: "22:30",
    location: "Palm Residency Clubhouse",
    expectedGuests: 140,
    totalBudget: 120000,
    currency: "INR",
    theme: "Festival of Lights",
    style: "Community festive",
    priorities: ["Decoration", "Cultural programme", "Dinner"],
    coverColor: "oklch(0.72 0.13 70)",
    createdAt: "2026-10-10T09:15:00Z",
  },
];

export const demoTasks: Task[] = [
  {
    id: "task_1",
    title: "Confirm venue booking",
    description: "Sign contract and pay advance for The Tamarind Hall.",
    status: "completed",
    priority: "critical",
    dueDate: "2026-10-10",
    category: "venue",
    owner: "Priya",
    eventId: weddingEventId,
  },
  {
    id: "task_2",
    title: "Finalize caterer and menu",
    description: "Lock menu, tasting session, confirm Jain meal count.",
    status: "in_progress",
    priority: "critical",
    dueDate: "2026-11-05",
    category: "food",
    owner: "Rahul",
    eventId: weddingEventId,
  },
  {
    id: "task_3",
    title: "Book photographer and videographer",
    description: "Confirm pre-wedding shoot and event-day coverage.",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-11-10",
    category: "photography",
    owner: "Priya",
    eventId: weddingEventId,
  },
  {
    id: "task_4",
    title: "Complete guest list with addresses",
    description: "Collect phone numbers and email addresses for invitations.",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-10-30",
    category: "planning",
    owner: "Anita",
    eventId: weddingEventId,
  },
  {
    id: "task_5",
    title: "Send digital invitations",
    description: "Send save-the-date and RSVP-enabled invitations.",
    status: "not_started",
    priority: "medium",
    dueDate: "2026-11-15",
    category: "planning",
    owner: "Anita",
    dependsOn: ["task_4"],
    eventId: weddingEventId,
  },
  {
    id: "task_6",
    title: "Book decorator for mandap",
    description: "Ivory and marigold theme mandap and stage setup.",
    status: "not_started",
    priority: "high",
    dueDate: "2026-11-20",
    category: "decoration",
    eventId: weddingEventId,
  },
  {
    id: "task_7",
    title: "Order wedding outfits and accessories",
    description: "Final fitting scheduled for last week of November.",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-11-25",
    category: "planning",
    owner: "Priya",
    eventId: weddingEventId,
  },
  {
    id: "task_8",
    title: "Arrange transportation for guests",
    description: "Bus from central pickup points to venue.",
    status: "not_started",
    priority: "medium",
    dueDate: "2026-12-05",
    category: "transportation",
    eventId: weddingEventId,
  },
  {
    id: "task_9",
    title: "Confirm music and entertainment",
    description: "DJ for reception and live music for ceremony.",
    status: "not_started",
    priority: "medium",
    dueDate: "2026-12-01",
    category: "entertainment",
    eventId: weddingEventId,
  },
  {
    id: "task_10",
    title: "Prepare emergency kit",
    description: "Pins, first aid, medicines, change of accessories.",
    status: "not_started",
    priority: "low",
    dueDate: "2026-12-13",
    category: "logistics",
    eventId: weddingEventId,
  },
  {
    id: "task_11",
    title: "Confirm seating arrangement",
    description: "Finalize table plan and seating cards.",
    status: "not_started",
    priority: "medium",
    dueDate: "2026-12-10",
    category: "planning",
    dependsOn: ["task_4"],
    eventId: weddingEventId,
  },
  {
    id: "task_12",
    title: "Brief vendors on event-day schedule",
    description: "Share detailed timing with all booked vendors.",
    status: "not_started",
    priority: "medium",
    dueDate: "2026-12-12",
    category: "logistics",
    eventId: weddingEventId,
  },
  {
    id: "task_13",
    title: "Pay remaining vendor balances",
    description: "Settle all dues 3 days before event.",
    status: "not_started",
    priority: "high",
    dueDate: "2026-12-12",
    category: "planning",
    eventId: weddingEventId,
  },
  {
    id: "task_14",
    title: "Order return gifts",
    description: "230 small gifts for guests.",
    status: "not_started",
    priority: "low",
    dueDate: "2026-12-08",
    category: "planning",
    eventId: weddingEventId,
  },
  {
    id: "task_15",
    title: "Confirm hair and makeup artist",
    description: "Trial session and event-day booking.",
    status: "completed",
    priority: "high",
    dueDate: "2026-10-20",
    category: "planning",
    owner: "Priya",
    eventId: weddingEventId,
  },
];

export const demoVendors: Vendor[] = [
  {
    id: "vendor_1",
    name: "The Tamarind Hall",
    category: "venue",
    contactName: "Mr. Suresh",
    phone: "+91 98450 12345",
    email: "events@tamarindhall.in",
    estimatedCost: 150000,
    actualCost: 150000,
    status: "booked",
    bookingDate: "2026-10-08",
    notes: "Includes AC hall, dining area, and parking for 80 cars.",
    eventId: weddingEventId,
  },
  {
    id: "vendor_2",
    name: "Saffron Caterers",
    category: "food",
    contactName: "Mrs. Lakshmi",
    phone: "+91 99000 56789",
    estimatedCost: 120000,
    actualCost: 125000,
    status: "negotiating",
    notes: "South Indian + North Indian menu, 30 Jain meals confirmed.",
    eventId: weddingEventId,
  },
  {
    id: "vendor_3",
    name: "Lumen Studios",
    category: "photography",
    contactName: "Karthik",
    phone: "+91 90080 43210",
    email: "hello@lumenstudios.in",
    estimatedCost: 60000,
    status: "contacted",
    notes: "Cinematic film + 500 edited photos. Pre-wedding shoot extra.",
    eventId: weddingEventId,
  },
  {
    id: "vendor_4",
    name: "Marigold Decorators",
    category: "decoration",
    contactName: "Anjali",
    phone: "+91 98456 78900",
    estimatedCost: 45000,
    status: "shortlisted",
    notes: "Ivory and marigold theme. Stage, mandap, entrance, table centerpieces.",
    eventId: weddingEventId,
  },
  {
    id: "vendor_5",
    name: "DJ Anshul",
    category: "entertainment",
    contactName: "Anshul",
    phone: "+91 99860 11223",
    estimatedCost: 25000,
    status: "researching",
    notes: "Bollywood + retro set. 6 hour coverage.",
    eventId: weddingEventId,
  },
  {
    id: "vendor_6",
    name: "Green Line Transport",
    category: "transportation",
    contactName: "Mr. Reddy",
    phone: "+91 99001 22334",
    estimatedCost: 18000,
    status: "researching",
    notes: "2 buses from Jayanagar and Indiranagar pickup points.",
    eventId: weddingEventId,
  },
];

export const demoGuests: Guest[] = [
  {
    id: "g_1",
    name: "Sundaram Iyer",
    group: "Bride's family",
    phone: "+91 98450 11111",
    rsvp: "accepted",
    mealPreference: "veg",
    plusOnes: 1,
    eventId: weddingEventId,
  },
  {
    id: "g_2",
    name: "Lakshmi Iyer",
    group: "Bride's family",
    phone: "+91 98450 22222",
    rsvp: "accepted",
    mealPreference: "veg",
    eventId: weddingEventId,
  },
  {
    id: "g_3",
    name: "Rajesh Sharma",
    group: "Groom's family",
    phone: "+91 99860 33333",
    rsvp: "accepted",
    mealPreference: "non-veg",
    plusOnes: 2,
    eventId: weddingEventId,
  },
  {
    id: "g_4",
    name: "Meera Nair",
    group: "Friends",
    phone: "+91 90080 44444",
    rsvp: "pending",
    mealPreference: "jain",
    eventId: weddingEventId,
  },
  {
    id: "g_5",
    name: "Arjun Patel",
    group: "Groom's family",
    phone: "+91 99720 55555",
    rsvp: "accepted",
    mealPreference: "veg",
    plusOnes: 1,
    eventId: weddingEventId,
  },
  {
    id: "g_6",
    name: "Kavya Reddy",
    group: "Friends",
    phone: "+91 98456 66666",
    rsvp: "declined",
    mealPreference: "veg",
    notes: "Out of country for work.",
    eventId: weddingEventId,
  },
  {
    id: "g_7",
    name: "Vikram Gupta",
    group: "Colleagues",
    phone: "+91 99001 77777",
    rsvp: "pending",
    mealPreference: "non-veg",
    plusOnes: 1,
    eventId: weddingEventId,
  },
  {
    id: "g_8",
    name: "Ananya Krishnan",
    group: "Friends",
    phone: "+91 99860 88888",
    rsvp: "accepted",
    mealPreference: "veg",
    eventId: weddingEventId,
  },
  {
    id: "g_9",
    name: "Prakash Menon",
    group: "Bride's family",
    phone: "+91 98450 99999",
    rsvp: "accepted",
    mealPreference: "jain",
    plusOnes: 1,
    eventId: weddingEventId,
  },
  {
    id: "g_10",
    name: "Deepa Srinivasan",
    group: "Bride's family",
    rsvp: "pending",
    mealPreference: "veg",
    eventId: weddingEventId,
  },
];

export const demoExpenses: Expense[] = [
  {
    id: "exp_1",
    category: "venue",
    description: "Venue booking advance",
    plannedAmount: 75000,
    actualAmount: 75000,
    date: "2026-10-08",
    eventId: weddingEventId,
  },
  {
    id: "exp_2",
    category: "venue",
    description: "Venue balance payment",
    plannedAmount: 75000,
    actualAmount: 75000,
    date: "2026-10-08",
    eventId: weddingEventId,
  },
  {
    id: "exp_3",
    category: "food",
    description: "Catering advance",
    plannedAmount: 30000,
    actualAmount: 30000,
    date: "2026-10-20",
    eventId: weddingEventId,
  },
  {
    id: "exp_4",
    category: "photography",
    description: "Photography booking advance",
    plannedAmount: 15000,
    actualAmount: 15000,
    date: "2026-10-25",
    eventId: weddingEventId,
  },
  {
    id: "exp_5",
    category: "decoration",
    description: "Decorator advance",
    plannedAmount: 10000,
    actualAmount: 10000,
    date: "2026-10-30",
    eventId: weddingEventId,
  },
  {
    id: "exp_6",
    category: "planning" as BudgetCategory,
    description: "Outfit advance",
    plannedAmount: 20000,
    actualAmount: 22000,
    date: "2026-10-15",
    notes: "Adjusted for embroidery work.",
    eventId: weddingEventId,
  },
  {
    id: "exp_7",
    category: "entertainment",
    description: "DJ booking advance",
    plannedAmount: 5000,
    actualAmount: 5000,
    date: "2026-11-01",
    eventId: weddingEventId,
  },
  {
    id: "exp_8",
    category: "transportation",
    description: "Bus booking advance",
    plannedAmount: 5000,
    actualAmount: 5000,
    date: "2026-11-05",
    eventId: weddingEventId,
  },
];

export const demoBudgetPlan: BudgetCategoryPlan[] = [
  { category: "venue", planned: 150000, spent: 150000 },
  { category: "food", planned: 120000, spent: 30000 },
  { category: "decoration", planned: 45000, spent: 10000 },
  { category: "photography", planned: 60000, spent: 15000 },
  { category: "entertainment", planned: 25000, spent: 5000 },
  { category: "transportation", planned: 18000, spent: 5000 },
  { category: "contingency", planned: 62000, spent: 0 },
];

export const demoTimelineMilestones: TimelineMilestone[] = [
  {
    id: "ms_1",
    title: "Engagement ceremony",
    date: "2026-09-12",
    description: "Family-only engagement at home.",
    completed: true,
    eventId: weddingEventId,
  },
  {
    id: "ms_2",
    title: "Venue booking confirmed",
    date: "2026-10-08",
    description: "The Tamarind Hall booked for 15 December.",
    completed: true,
    eventId: weddingEventId,
  },
  {
    id: "ms_3",
    title: "Save-the-date sent",
    date: "2026-10-25",
    completed: true,
    eventId: weddingEventId,
  },
  {
    id: "ms_4",
    title: "Caterer finalized",
    date: "2026-11-05",
    description: "Menu locked, Jain meals counted.",
    completed: false,
    eventId: weddingEventId,
  },
  {
    id: "ms_5",
    title: "Photographer booked",
    date: "2026-11-10",
    completed: false,
    eventId: weddingEventId,
  },
  {
    id: "ms_6",
    title: "Pre-wedding shoot",
    date: "2026-11-28",
    completed: false,
    eventId: weddingEventId,
  },
  {
    id: "ms_7",
    title: "Mehendi ceremony",
    date: "2026-12-13",
    completed: false,
    eventId: weddingEventId,
  },
  {
    id: "ms_8",
    title: "Wedding day",
    date: "2026-12-15",
    description: "Main ceremony and reception.",
    completed: false,
    eventId: weddingEventId,
  },
];

export const demoSchedule: ScheduleItem[] = [
  {
    id: "sch_1",
    time: "08:00",
    endTime: "09:30",
    title: "Decoration Setup",
    description: "Mandap and stage floral arrangement by Marigold Decorators.",
    location: "Main Hall",
    status: "scheduled",
    owner: "Anjali",
    eventId: weddingEventId,
  },
  {
    id: "sch_2",
    time: "09:30",
    endTime: "10:00",
    title: "Vendor Arrival",
    description: "Caterer, photographer, and DJ setup.",
    location: "Loading Bay",
    status: "scheduled",
    eventId: weddingEventId,
  },
  {
    id: "sch_3",
    time: "10:00",
    endTime: "11:30",
    title: "Bridal Preparation",
    description: "Hair, makeup, and draping.",
    location: "Bridal Suite",
    status: "scheduled",
    owner: "Priya",
    eventId: weddingEventId,
  },
  {
    id: "sch_4",
    time: "10:30",
    endTime: "11:30",
    title: "Photography Begins",
    description: "Pre-ceremony portraits and family shots.",
    location: "Garden Lawn",
    status: "scheduled",
    owner: "Karthik",
    eventId: weddingEventId,
  },
  {
    id: "sch_5",
    time: "11:00",
    endTime: "12:00",
    title: "Guest Arrival",
    description: "Welcome drinks and seating.",
    location: "Entrance",
    status: "scheduled",
    eventId: weddingEventId,
  },
  {
    id: "sch_6",
    time: "12:30",
    endTime: "13:30",
    title: "Ceremony",
    description: "Main wedding rituals.",
    location: "Mandap",
    status: "scheduled",
    eventId: weddingEventId,
  },
  {
    id: "sch_7",
    time: "14:00",
    endTime: "15:30",
    title: "Lunch",
    description: "Buffet lunch for all guests.",
    location: "Dining Hall",
    status: "scheduled",
    eventId: weddingEventId,
  },
  {
    id: "sch_8",
    time: "16:00",
    endTime: "17:30",
    title: "Reception Welcome",
    description: "Receiving line and guest greetings.",
    location: "Reception Foyer",
    status: "scheduled",
    eventId: weddingEventId,
  },
  {
    id: "sch_9",
    time: "17:30",
    endTime: "18:30",
    title: "Entertainment Programme",
    description: "Family performances and music.",
    location: "Main Stage",
    status: "scheduled",
    eventId: weddingEventId,
  },
  {
    id: "sch_10",
    time: "18:30",
    endTime: "19:30",
    title: "Reception Dinner",
    description: "Sit-down dinner with live counters.",
    location: "Dining Hall",
    status: "scheduled",
    eventId: weddingEventId,
  },
  {
    id: "sch_11",
    time: "20:00",
    endTime: "21:00",
    title: "Cake Cutting & Toasts",
    description: "Cake cutting and family speeches.",
    location: "Main Stage",
    status: "scheduled",
    eventId: weddingEventId,
  },
  {
    id: "sch_12",
    time: "21:00",
    endTime: "22:00",
    title: "Send-off",
    description: "Final farewell and guest departure.",
    location: "Entrance",
    status: "scheduled",
    eventId: weddingEventId,
  },
];

export const demoNotifications: AppNotification[] = [
  {
    id: "n_1",
    type: "task_overdue",
    title: "Task overdue",
    message: "Complete guest list with addresses was due on 30 October.",
    timestamp: "2026-11-02T08:30:00Z",
    read: false,
    eventId: weddingEventId,
  },
  {
    id: "n_2",
    type: "deadline_approaching",
    title: "Deadline approaching",
    message: "Finalize caterer and menu is due in 3 days.",
    timestamp: "2026-11-02T07:00:00Z",
    read: false,
    eventId: weddingEventId,
  },
  {
    id: "n_3",
    type: "budget_warning",
    title: "Budget update",
    message: "Outfit expense exceeded planned amount by ₹2,000.",
    timestamp: "2026-10-16T10:00:00Z",
    read: true,
    eventId: weddingEventId,
  },
  {
    id: "n_4",
    type: "vendor_warning",
    title: "Vendor follow-up needed",
    message: "Lumen Studios has not confirmed booking yet.",
    timestamp: "2026-10-29T14:30:00Z",
    read: false,
    eventId: weddingEventId,
  },
  {
    id: "n_5",
    type: "ai_plan_generated",
    title: "Plan ready",
    message: "Your AI-generated event plan is ready to review.",
    timestamp: "2026-10-01T10:05:00Z",
    read: true,
    eventId: weddingEventId,
  },
  {
    id: "n_6",
    type: "guest_reminder",
    title: "RSVP reminder",
    message: "12 guests have not responded. Send a gentle reminder.",
    timestamp: "2026-11-01T09:00:00Z",
    read: false,
    eventId: weddingEventId,
  },
  {
    id: "n_7",
    type: "task_completed",
    title: "Task completed",
    message: "Confirm hair and makeup artist marked complete.",
    timestamp: "2026-10-20T16:45:00Z",
    read: true,
    eventId: weddingEventId,
  },
];

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
