"use client";

import { create } from "zustand";
import {
  AppNotification,
  CelebrationEvent,
  ChatMessage,
  Expense,
  Guest,
  RsvpStatus,
  ScheduleItem,
  Task,
  TaskStatus,
  TimelineMilestone,
  Vendor,
  VendorStatus,
  demoEvents,
  demoExpenses,
  demoGuests,
  demoNotifications,
  demoSchedule,
  demoTasks,
  demoTimelineMilestones,
  demoVendors,
} from "./mock-data";
import { uid } from "./format";

export type PublicView =
  | "home"
  | "about"
  | "features"
  | "faq"
  | "login"
  | "register"
  | "privacy"
  | "terms";

export type OnboardingView =
  | "onboarding_welcome"
  | "onboarding_event_type"
  | "onboarding_details"
  | "onboarding_budget"
  | "onboarding_preferences"
  | "onboarding_generate"
  | "onboarding_review";

export type AppView =
  | "dashboard"
  | "event_overview"
  | "create_event"
  | "edit_event"
  | "budget"
  | "expenses"
  | "tasks"
  | "timeline"
  | "vendors"
  | "guests"
  | "event_day"
  | "ai_assistant"
  | "notifications"
  | "settings"
  | "export";

export type Route =
  | { kind: "public"; view: PublicView }
  | { kind: "onboarding"; view: OnboardingView }
  | { kind: "app"; view: AppView };

interface AppState {
  // Auth state (frontend-only demo)
  isAuthed: boolean;
  user: { name: string; email: string } | null;

  // Navigation
  route: Route;
  navigate: (route: Route) => void;

  // Onboarding draft
  onboardingDraft: Partial<CelebrationEvent> & { priorities?: string[] };
  setOnboardingDraft: (patch: Partial<CelebrationEvent>) => void;
  resetOnboardingDraft: () => void;

  // Events
  events: CelebrationEvent[];
  currentEventId: string | null;
  setCurrentEvent: (id: string) => void;
  createEvent: (data: Omit<CelebrationEvent, "id" | "createdAt">) => string;
  updateEvent: (id: string, patch: Partial<CelebrationEvent>) => void;
  deleteEvent: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  // Vendors
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, "id">) => void;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  setVendorStatus: (id: string, status: VendorStatus) => void;
  deleteVendor: (id: string) => void;

  // Guests
  guests: Guest[];
  addGuest: (guest: Omit<Guest, "id">) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  setRsvp: (id: string, rsvp: RsvpStatus) => void;
  deleteGuest: (id: string) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Timeline milestones
  milestones: TimelineMilestone[];
  addMilestone: (m: Omit<TimelineMilestone, "id">) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;

  // Schedule
  schedule: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, "id">) => void;
  updateScheduleItem: (id: string, patch: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;

  // AI chat
  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (eventId: string, content: string) => Promise<void>;
  retryLastMessage: (eventId: string) => Promise<void>;
  clearChat: (eventId: string) => void;

  // Auth actions
  login: (email: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
}

const initialRoute: Route = { kind: "public", view: "home" };

export const useAppStore = create<AppState>((set, get) => ({
  isAuthed: false,
  user: null,

  route: initialRoute,
  navigate: (route) => {
    set({ route });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  },

  onboardingDraft: {},
  setOnboardingDraft: (patch) =>
    set((s) => ({
      onboardingDraft: { ...s.onboardingDraft, ...patch },
    })),
  resetOnboardingDraft: () => set({ onboardingDraft: {} }),

  events: demoEvents,
  currentEventId: demoEvents[0].id,
  setCurrentEvent: (id) => set({ currentEventId: id }),
  createEvent: (data) => {
    const id = uid("evt");
    const newEvent: CelebrationEvent = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      events: [...s.events, newEvent],
      currentEventId: id,
    }));
    return id;
  },
  updateEvent: (id, patch) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
  deleteEvent: (id) =>
    set((s) => {
      const remaining = s.events.filter((e) => e.id !== id);
      return {
        events: remaining,
        currentEventId:
          s.currentEventId === id ? remaining[0]?.id ?? null : s.currentEventId,
      };
    }),

  tasks: demoTasks,
  addTask: (task) =>
    set((s) => ({ tasks: [...s.tasks, { ...task, id: uid("task") }] })),
  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  setTaskStatus: (id, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
  deleteTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  vendors: demoVendors,
  addVendor: (vendor) =>
    set((s) => ({ vendors: [...s.vendors, { ...vendor, id: uid("vendor") }] })),
  updateVendor: (id, patch) =>
    set((s) => ({
      vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    })),
  setVendorStatus: (id, status) =>
    set((s) => ({
      vendors: s.vendors.map((v) => (v.id === id ? { ...v, status } : v)),
    })),
  deleteVendor: (id) =>
    set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) })),

  guests: demoGuests,
  addGuest: (guest) =>
    set((s) => ({ guests: [...s.guests, { ...guest, id: uid("g") }] })),
  updateGuest: (id, patch) =>
    set((s) => ({
      guests: s.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    })),
  setRsvp: (id, rsvp) =>
    set((s) => ({
      guests: s.guests.map((g) => (g.id === id ? { ...g, rsvp } : g)),
    })),
  deleteGuest: (id) =>
    set((s) => ({ guests: s.guests.filter((g) => g.id !== id) })),

  expenses: demoExpenses,
  addExpense: (expense) =>
    set((s) => ({ expenses: [...s.expenses, { ...expense, id: uid("exp") }] })),
  updateExpense: (id, patch) =>
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
  deleteExpense: (id) =>
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

  milestones: demoTimelineMilestones,
  addMilestone: (m) =>
    set((s) => ({ milestones: [...s.milestones, { ...m, id: uid("ms") }] })),
  toggleMilestone: (id) =>
    set((s) => ({
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      ),
    })),
  deleteMilestone: (id) =>
    set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),

  schedule: demoSchedule,
  addScheduleItem: (item) =>
    set((s) => ({ schedule: [...s.schedule, { ...item, id: uid("sch") }] })),
  updateScheduleItem: (id, patch) =>
    set((s) => ({
      schedule: s.schedule.map((it) =>
        it.id === id ? { ...it, ...patch } : it
      ),
    })),
  deleteScheduleItem: (id) =>
    set((s) => ({ schedule: s.schedule.filter((it) => it.id !== id) })),

  notifications: demoNotifications,
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  addNotification: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: uid("n"),
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...s.notifications,
      ],
    })),

  chatMessages: {},
  sendChatMessage: (eventId, content) => {
    const userMsg: ChatMessage = {
      id: uid("msg"),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      chatMessages: {
        ...s.chatMessages,
        [eventId]: [...(s.chatMessages[eventId] ?? []), userMsg],
      },
    }));

    return generateResponseForEvent(eventId, content, get, set);
  },
  retryLastMessage: (eventId) => {
    // Retry the AI response for the last user message WITHOUT re-adding the
    // user message. This prevents duplicate user messages on retry.
    const messages = get().chatMessages[eventId] ?? [];
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) {
      return Promise.reject(new Error("No message to retry"));
    }
    return generateResponseForEvent(eventId, lastUserMsg.content, get, set);
  },
  clearChat: (eventId) =>
    set((s) => ({
      chatMessages: { ...s.chatMessages, [eventId]: [] },
    })),

  login: (email) =>
    set({
      isAuthed: true,
      user: { name: email.split("@")[0] || "User", email },
      route: { kind: "app", view: "dashboard" },
    }),
  register: (name, email) =>
    set({
      isAuthed: true,
      user: { name, email },
      route: { kind: "onboarding", view: "onboarding_welcome" },
    }),
  logout: () =>
    set({
      isAuthed: false,
      user: null,
      route: { kind: "public", view: "home" },
    }),
}));

function generateAssistantResponse(
  userMessage: string,
  event: CelebrationEvent | undefined,
  tasks: Task[]
): string {
  if (!event) {
    return "I do not have an event selected. Please choose an event from the sidebar to continue.";
  }
  const msg = userMessage.toLowerCase();
  const overdue = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      new Date(t.dueDate).getTime() < Date.now()
  );
  if (msg.includes("prioriti")) {
    const next = tasks
      .filter((t) => t.status !== "completed")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5)
      .map((t) => `- ${t.title} (due ${t.dueDate})`)
      .join("\n");
    return `For ${event.name}, here is what I would prioritize this week:\n\n${next}\n\nTackling these in order keeps the timeline intact and avoids last-minute rushes.`;
  }
  if (msg.includes("budget") || msg.includes("reduce")) {
    return `Looking at ${event.name}, here are three places to look for savings:\n\n- Revisit the decoration budget. Smaller stage pieces and locally sourced flowers can save 15 to 20 percent.\n- Negotiate the catering rate per plate. A revised guest count usually unlocks better pricing.\n- Move the contingency line down only after venue and food are confirmed. Holding it at 12 percent is safer.`;
  }
  if (msg.includes("overdue") || msg.includes("forget")) {
    if (overdue.length === 0) {
      return `No overdue tasks for ${event.name}. The next items due are operational ones in the final week. Want me to draft a 7-day pre-event checklist?`;
    }
    const list = overdue
      .map((t) => `- ${t.title} (was due ${t.dueDate})`)
      .join("\n");
    return `These tasks are overdue for ${event.name}:\n\n${list}\n\nRecommend reassigning owners and moving due dates realistically. Want me to suggest revised dates?`;
  }
  if (msg.includes("checklist") || msg.includes("7-day") || msg.includes("seven")) {
    return `Here is a focused 7-day checklist for ${event.name}:\n\n1. Confirm all vendor arrival times in writing.\n2. Final headcount to caterer (veg, non-veg, jain split).\n3. Final seating chart and table cards printed.\n4. Emergency kit packed (pins, first aid, charger, medicines).\n5. Brief family on event-day responsibilities.\n6. Confirm transport pickup times for guests.\n7. Rest well the night before.`;
  }
  return `I am tracking ${event.name} scheduled for ${event.date}. I can help you prioritize tasks, review budget trade-offs, surface overdue items, and prepare a final week checklist. Try asking what to prioritize this week.`;
}

// Helper: generate an AI response for an event without re-adding the user message.
// Used by both sendChatMessage (initial send) and retryLastMessage (retry on failure).
// This prevents duplicate user messages when a user retries a failed request.
function generateResponseForEvent(
  eventId: string,
  content: string,
  get: () => AppState,
  set: (partial: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Generate a thoughtful canned response based on event context and message.
    // In production this would be an authenticated API call to an AI model.
    // The 900ms delay simulates network + model latency. A small failure rate
    // exercises the error UI path so users see the retry affordance.
    const event = get().events.find((e) => e.id === eventId);
    const tasks = get().tasks.filter((t) => t.eventId === eventId);
    const response = generateAssistantResponse(content, event, tasks);

    setTimeout(() => {
      // Simulate transient failures (~10% of the time) so the error UI
      // and retry button are reachable. This mirrors real-world AI API
      // behavior where rate limits and network hiccups occur.
      const shouldFail = Math.random() < 0.1;
      if (shouldFail) {
        reject(new Error("AI service temporarily unavailable"));
        return;
      }
      set((s) => ({
        chatMessages: {
          ...s.chatMessages,
          [eventId]: [
            ...(s.chatMessages[eventId] ?? []),
            {
              id: uid("msg"),
              role: "assistant",
              content: response,
              timestamp: new Date().toISOString(),
              isAiGenerated: true,
            },
          ],
        },
      }));
      resolve();
    }, 900);
  });
}
