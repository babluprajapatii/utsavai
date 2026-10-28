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
  EventType,
  BudgetCategory,
} from "./mock-data";
import { uid } from "./format";
import { getCurrentUser, onAuthStateChange, signOutUser } from "./auth";
import { apiClient } from "./api-client";

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

const EVENT_TYPE_MAP: Record<string, EventType> = {
  wedding: "wedding",
  birthday: "birthday",
  community: "community",
  family: "family",
  custom: "custom",
  Wedding: "wedding",
  Birthday: "birthday",
  "Community Event": "community",
  "Family Celebration": "family",
  "Custom Event": "custom",
};

const BUDGET_CATEGORY_MAP: Record<string, BudgetCategory> = {
  venue: "venue",
  food: "food",
  decoration: "decoration",
  photography: "photography",
  entertainment: "entertainment",
  transportation: "transportation",
  contingency: "contingency",
  Venue: "venue",
  Catering: "food",
  Decoration: "decoration",
  Photography: "photography",
  Music: "entertainment",
  Security: "contingency",
  Other: "contingency",
};

const STATUS_MAP: Record<string, TaskStatus> = {
  "Not Started": "not_started",
  "In Progress": "in_progress",
  Completed: "completed",
  not_started: "not_started",
  in_progress: "in_progress",
  completed: "completed",
};

function normalizeEventType(value: unknown): EventType {
  return EVENT_TYPE_MAP[String(value ?? "wedding")] ?? "wedding";
}

function normalizeBudgetCategory(value: unknown): BudgetCategory {
  return BUDGET_CATEGORY_MAP[String(value ?? "contingency")] ?? "contingency";
}

function normalizeTaskStatus(value: unknown): TaskStatus {
  return STATUS_MAP[String(value ?? "not_started")] ?? "not_started";
}

function normalizePriority(value: unknown): Task["priority"] {
  const v = String(value ?? "medium").toLowerCase();
  if (["low", "medium", "high", "critical"].includes(v)) {
    return v as Task["priority"];
  }
  return "medium";
}

function normalizeRsvp(value: unknown): RsvpStatus {
  const v = String(value ?? "pending").toLowerCase();
  if (v === "accepted" || v === "declined" || v === "pending") {
    return v as RsvpStatus;
  }
  return "pending";
}

function normalizeVendorStatus(value: unknown): VendorStatus {
  const v = String(value ?? "researching").toLowerCase();
  if (
    [
      "researching",
      "shortlisted",
      "contacted",
      "negotiating",
      "booked",
      "completed",
      "cancelled",
    ].includes(v)
  ) {
    return v as VendorStatus;
  }
  return "researching";
}

function toDisplayEvent(raw: any): CelebrationEvent {
  const priorities = Array.isArray(raw?.priorities)
    ? raw.priorities.map((item: unknown) => String(item))
    : Array.isArray(raw?.event_preferences?.priorities)
      ? raw.event_preferences.priorities.map((item: unknown) => String(item))
      : [];

  return {
    id: raw?.id ?? uid("evt"),
    name: raw?.name ?? "Untitled event",
    type: normalizeEventType(raw?.type ?? raw?.event_type),
    date: raw?.event_date ?? raw?.date ?? new Date().toISOString().slice(0, 10),
    startTime: raw?.start_time ?? raw?.startTime ?? "10:00",
    endTime: raw?.end_time ?? raw?.endTime ?? "22:00",
    location: raw?.location ?? "",
    expectedGuests: Number(raw?.guest_count ?? raw?.expectedGuests ?? 0),
    totalBudget: Number(raw?.total_budget ?? raw?.totalBudget ?? 0),
    currency: raw?.currency ?? "INR",
    theme: raw?.theme ?? undefined,
    style: raw?.style ?? undefined,
    priorities,
    specialRequirements: raw?.special_requirements ?? raw?.specialRequirements ?? undefined,
    coverColor: raw?.cover_color ?? raw?.coverColor ?? "oklch(0.55 0.14 35)",
    createdAt: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
  };
}

function toDisplayTask(raw: any): Task {
  return {
    id: raw?.id ?? uid("task"),
    title: raw?.title ?? "Untitled task",
    description: raw?.description ?? undefined,
    status: normalizeTaskStatus(raw?.status),
    priority: normalizePriority(raw?.priority),
    dueDate: raw?.due_date ?? raw?.dueDate ?? new Date().toISOString().slice(0, 10),
    category: (raw?.category as Task["category"]) ?? "planning",
    owner: raw?.assigned_to ?? raw?.owner ?? undefined,
    dependsOn: Array.isArray(raw?.depends_on)
      ? raw.depends_on.map((item: any) => String(item))
      : [],
    eventId: raw?.event_id ?? raw?.eventId ?? "",
  };
}

function toDisplayVendor(raw: any): Vendor {
  return {
    id: raw?.id ?? uid("vendor"),
    name: raw?.name ?? "Untitled vendor",
    category: normalizeBudgetCategory(raw?.category ?? raw?.category_name),
    contactName: raw?.contact_name ?? raw?.contactName ?? undefined,
    phone: raw?.contact_phone ?? raw?.phone ?? undefined,
    email: raw?.contact_email ?? raw?.email ?? undefined,
    estimatedCost: Number(raw?.quoted_price ?? raw?.estimatedCost ?? 0),
    actualCost: raw?.agreed_price ?? raw?.actualCost ?? undefined,
    status: normalizeVendorStatus(raw?.status),
    bookingDate: raw?.booking_date ?? raw?.bookingDate ?? undefined,
    notes: raw?.notes ?? undefined,
    eventId: raw?.event_id ?? raw?.eventId ?? "",
  };
}

function toDisplayGuest(raw: any): Guest {
  return {
    id: raw?.id ?? uid("g"),
    name: raw?.name ?? "Guest",
    group: raw?.group_name ?? raw?.group ?? undefined,
    phone: raw?.phone ?? undefined,
    email: raw?.email ?? undefined,
    rsvp: normalizeRsvp(raw?.rsvp_status ?? raw?.rsvp),
    mealPreference: raw?.meal_preference ?? raw?.mealPreference ?? undefined,
    specialRequirements: raw?.special_requirements ?? raw?.specialRequirements ?? undefined,
    notes: raw?.notes ?? undefined,
    plusOnes: raw?.plus_one ?? raw?.plusOnes ?? 0,
    eventId: raw?.event_id ?? raw?.eventId ?? "",
  };
}

function toDisplayExpense(raw: any): Expense {
  return {
    id: raw?.id ?? uid("exp"),
    category: normalizeBudgetCategory(raw?.category ?? raw?.category_name),
    description: raw?.description ?? "Expense",
    plannedAmount: Number(raw?.planned_amount ?? raw?.plannedAmount ?? 0),
    actualAmount: Number(raw?.actual_amount ?? raw?.actualAmount ?? 0),
    date: raw?.expense_date ?? raw?.date ?? new Date().toISOString().slice(0, 10),
    notes: raw?.notes ?? undefined,
    eventId: raw?.event_id ?? raw?.eventId ?? "",
  };
}

function toDisplayMilestone(raw: any): TimelineMilestone {
  return {
    id: raw?.id ?? uid("ms"),
    title: raw?.title ?? "Milestone",
    date: raw?.milestone_date ?? raw?.date ?? new Date().toISOString().slice(0, 10),
    description: raw?.description ?? undefined,
    completed: Boolean(raw?.completed ?? (String(raw?.status ?? "").toLowerCase() === "completed")),
    eventId: raw?.event_id ?? raw?.eventId ?? "",
  };
}

function toDisplaySchedule(raw: any): ScheduleItem {
  return {
    id: raw?.id ?? uid("sch"),
    time: raw?.start_time ?? raw?.time ?? "09:00",
    endTime: raw?.end_time ?? raw?.endTime ?? undefined,
    title: raw?.activity ?? raw?.title ?? "Schedule item",
    description: raw?.description ?? undefined,
    location: raw?.location ?? undefined,
    status: (raw?.status ?? "scheduled") as ScheduleItem["status"],
    owner: raw?.responsible_person ?? raw?.owner ?? undefined,
    eventId: raw?.event_id ?? raw?.eventId ?? "",
  };
}

function toDisplayNotification(raw: any): AppNotification {
  return {
    id: raw?.id ?? uid("n"),
    type: (raw?.type ?? "task_completed") as AppNotification["type"],
    title: raw?.title ?? "Notification",
    message: raw?.message ?? "",
    timestamp: raw?.created_at ?? raw?.timestamp ?? new Date().toISOString(),
    read: Boolean(raw?.read ?? raw?.is_read ?? false),
    eventId: raw?.event_id ?? raw?.eventId,
  };
}

function toApiEventType(type: EventType | string): string {
  switch (String(type).toLowerCase()) {
    case "wedding": return "Wedding";
    case "birthday": return "Birthday";
    case "community": case "community event": return "Community Event";
    case "family": case "family celebration": return "Family Celebration";
    case "custom": case "custom event": return "Custom Event";
    default: return "Custom Event";
  }
}

function toApiTaskStatus(status: TaskStatus | string): string {
  switch (String(status).toLowerCase().replace(/[-_\s]+/g, " ")) {
    case "not started": case "not_started": return "Not Started";
    case "in progress": case "in_progress": return "In Progress";
    case "completed": return "Completed";
    default: return "Not Started";
  }
}

function toApiTaskPriority(priority: Task["priority"] | string): string {
  switch (String(priority).toLowerCase()) {
    case "low": return "Low";
    case "medium": return "Medium";
    case "high": return "High";
    case "critical": return "Critical";
    default: return "Medium";
  }
}

function toApiVendorCategory(cat: BudgetCategory | string): string {
  switch (String(cat).toLowerCase()) {
    case "venue": return "Venue";
    case "food": case "catering": return "Catering";
    case "photography": return "Photography";
    case "decoration": return "Decoration";
    case "entertainment": return "Entertainment";
    case "music": return "Music";
    case "transportation": return "Transportation";
    case "security": return "Security";
    case "other": case "contingency": return "Other";
    default: return "Other";
  }
}

function toApiVendorStatus(status: VendorStatus | string): string {
  switch (String(status).toLowerCase()) {
    case "researching": return "Researching";
    case "shortlisted": return "Shortlisted";
    case "contacted": return "Contacted";
    case "negotiating": return "Negotiating";
    case "booked": return "Booked";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return "Researching";
  }
}

function toApiRsvp(rsvp: RsvpStatus | string): string {
  switch (String(rsvp).toLowerCase()) {
    case "accepted": return "Accepted";
    case "declined": return "Declined";
    case "pending":
    default: return "Pending";
  }
}

function eventPayloadFromForm(data: Omit<CelebrationEvent, "id" | "createdAt">) {
  return {
    name: data.name,
    type: toApiEventType(data.type),
    event_date: data.date,
    start_time: data.startTime,
    end_time: data.endTime,
    location: data.location,
    guest_count: data.expectedGuests,
    total_budget: data.totalBudget,
    currency: data.currency,
    description: data.specialRequirements ?? null,
    status: "Planning",
  };
}

interface AppState {
  isAuthed: boolean;
  authLoading: boolean;
  user: { id?: string; name: string; email: string } | null;

  route: Route;
  navigate: (route: Route) => void;

  onboardingDraft: Partial<CelebrationEvent> & { priorities?: string[] };
  setOnboardingDraft: (patch: Partial<CelebrationEvent>) => void;
  resetOnboardingDraft: () => void;

  events: CelebrationEvent[];
  currentEventId: string | null;
  dataLoading: boolean;
  dataError: string | null;
  setCurrentEvent: (id: string) => void;
  loadEvents: () => Promise<void>;
  refreshCurrentEventData: (eventId?: string | null) => Promise<void>;
  createEvent: (data: Omit<CelebrationEvent, "id" | "createdAt">) => string;
  updateEvent: (id: string, patch: Partial<CelebrationEvent>) => void;
  deleteEvent: (id: string) => void;

  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, "id">) => void;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  setVendorStatus: (id: string, status: VendorStatus) => void;
  deleteVendor: (id: string) => void;

  guests: Guest[];
  addGuest: (guest: Omit<Guest, "id">) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  setRsvp: (id: string, rsvp: RsvpStatus) => void;
  deleteGuest: (id: string) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  milestones: TimelineMilestone[];
  addMilestone: (m: Omit<TimelineMilestone, "id">) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;

  schedule: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, "id">) => void;
  updateScheduleItem: (id: string, patch: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;

  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (eventId: string, content: string) => Promise<void>;
  retryLastMessage: (eventId: string) => Promise<void>;
  clearChat: (eventId: string) => void;

  setUser: (user: { id?: string; name: string; email: string } | null) => void;
  setAuthLoading: (loading: boolean) => void;
  initAuth: () => Promise<void>;
  login: (email: string, name?: string, id?: string) => void;
  register: (name: string, email: string, id?: string) => void;
  logout: () => Promise<void>;
}

const initialRoute: Route = { kind: "public", view: "home" };

export const useAppStore = create<AppState>((set, get) => ({
  isAuthed: false,
  authLoading: true,
  user: null,

  setUser: (user) => set({ user, isAuthed: !!user }),
  setAuthLoading: (authLoading) => set({ authLoading }),

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

  events: [],
  currentEventId: null,
  dataLoading: false,
  dataError: null,
  setCurrentEvent: (id) => set({ currentEventId: id }),
  loadEvents: async () => {
    set({ dataLoading: true, dataError: null });
    try {
      const response = await apiClient.events.list();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Unable to load events.");
      }
      const events = Array.isArray(response.data) ? response.data.map(toDisplayEvent) : [];
      const nextCurrentEventId = events[0]?.id ?? get().currentEventId;
      set({ events, currentEventId: nextCurrentEventId, dataLoading: false, dataError: null });
      if (nextCurrentEventId) {
        void get().refreshCurrentEventData(nextCurrentEventId);
      }
    } catch (error) {
      set({
        dataLoading: false,
        dataError: error instanceof Error ? error.message : "Failed to load events.",
      });
    }
  },
  refreshCurrentEventData: async (eventId) => {
    const id = eventId ?? get().currentEventId;
    if (!id) return;
    set({ dataLoading: true, dataError: null });
    try {
      const [tasksRes, vendorsRes, guestsRes, expensesRes, timelineRes, scheduleRes, notificationsRes] = await Promise.all([
        apiClient.tasks.list(id),
        apiClient.vendors.list(id),
        apiClient.guests.list(id),
        apiClient.expenses.list(id),
        apiClient.timeline.list(id),
        apiClient.schedule.list(id),
        apiClient.notifications.list(false),
      ]);

      const tasks = tasksRes.success && Array.isArray(tasksRes.data) ? tasksRes.data.map(toDisplayTask) : [];
      const vendors = vendorsRes.success && Array.isArray(vendorsRes.data) ? vendorsRes.data.map(toDisplayVendor) : [];
      const guests = guestsRes.success && Array.isArray(guestsRes.data) ? guestsRes.data.map(toDisplayGuest) : [];
      const expenses = expensesRes.success && Array.isArray(expensesRes.data) ? expensesRes.data.map(toDisplayExpense) : [];
      const milestones = timelineRes.success && Array.isArray(timelineRes.data) ? timelineRes.data.map(toDisplayMilestone) : [];
      const schedule = scheduleRes.success && Array.isArray(scheduleRes.data) ? scheduleRes.data.map(toDisplaySchedule) : [];
      const notifications = notificationsRes.success && Array.isArray(notificationsRes.data)
        ? notificationsRes.data.map(toDisplayNotification).filter((n) => !n.eventId || n.eventId === id)
        : [];

      set({
        tasks,
        vendors,
        guests,
        expenses,
        milestones,
        schedule,
        notifications,
        dataLoading: false,
        dataError: null,
      });
    } catch (error) {
      set({
        dataLoading: false,
        dataError: error instanceof Error ? error.message : "Failed to load event data.",
      });
    }
  },
  createEvent: (data) => {
    const tempId = uid("evt");
    const optimistic: CelebrationEvent = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ events: [optimistic, ...s.events], currentEventId: tempId }));
    void (async () => {
      const response = await apiClient.events.create(eventPayloadFromForm(data));
      if (response.success && response.data) {
        const created = toDisplayEvent(response.data);
        set((s) => ({
          events: [created, ...s.events.filter((event) => event.id !== tempId)],
          currentEventId: created.id,
        }));
      }
    })();
    return tempId;
  },
  updateEvent: (id, patch) => {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.type !== undefined) payload.type = toApiEventType(patch.type);
    if (patch.date !== undefined) payload.event_date = patch.date;
    if (patch.startTime !== undefined) payload.start_time = patch.startTime;
    if (patch.endTime !== undefined) payload.end_time = patch.endTime;
    if (patch.location !== undefined) payload.location = patch.location;
    if (patch.expectedGuests !== undefined) payload.guest_count = patch.expectedGuests;
    if (patch.totalBudget !== undefined) payload.total_budget = patch.totalBudget;
    if (patch.currency !== undefined) payload.currency = patch.currency;
    if (patch.theme !== undefined) payload.theme = patch.theme;
    if (patch.style !== undefined) payload.style = patch.style;
    if (patch.priorities !== undefined) payload.priorities = patch.priorities;
    if (patch.specialRequirements !== undefined) payload.special_requirements = patch.specialRequirements;
    if (patch.coverColor !== undefined) payload.cover_color = patch.coverColor;
    if (Object.keys(payload).length === 0) return;
    void (async () => {
      const response = await apiClient.events.update(id, payload);
      if (response.success && response.data) {
        const updated = toDisplayEvent(response.data);
        set((s) => ({ events: s.events.map((event) => (event.id === id ? updated : event)) }));
      }
    })();
  },
  deleteEvent: (id) =>
    void (async () => {
      const response = await apiClient.events.delete(id);
      if (response.success) {
        set((s) => {
          const remaining = s.events.filter((event) => event.id !== id);
          return {
            events: remaining,
            currentEventId: s.currentEventId === id ? remaining[0]?.id ?? null : s.currentEventId,
          };
        });
      }
    })(),

  tasks: [],
  addTask: (task) => {
    const localId = uid("task");
    set((s) => ({ tasks: [...s.tasks, { ...task, id: localId }] }));
    void (async () => {
      const payload = {
        title: task.title,
        description: task.description ?? null,
        category: task.category,
        priority: toApiTaskPriority(task.priority),
        status: toApiTaskStatus(task.status),
        due_date: task.dueDate,
        assigned_to: task.owner ?? null,
        notes: task.description ?? null,
      };
      const response = await apiClient.tasks.create(task.eventId, payload);
      if (response.success && response.data) {
        const created = toDisplayTask(response.data);
        set((s) => ({ tasks: s.tasks.map((item) => (item.id === localId ? created : item)) }));
      }
    })();
  },
  updateTask: (id, patch) => {
    const payload: Record<string, unknown> = {};
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.status !== undefined) payload.status = toApiTaskStatus(patch.status);
    if (patch.priority !== undefined) payload.priority = toApiTaskPriority(patch.priority);
    if (patch.dueDate !== undefined) payload.due_date = patch.dueDate;
    if (patch.category !== undefined) payload.category = patch.category;
    if (patch.owner !== undefined) payload.assigned_to = patch.owner;
    if (patch.dependsOn !== undefined) payload.depends_on = patch.dependsOn;
    void (async () => {
      const response = await apiClient.tasks.update(id, payload);
      if (response.success && response.data) {
        const updated = toDisplayTask(response.data);
        set((s) => ({ tasks: s.tasks.map((task) => (task.id === id ? updated : task)) }));
      }
    })();
  },
  setTaskStatus: (id, status) => {
    set((s) => ({ tasks: s.tasks.map((task) => (task.id === id ? { ...task, status } : task)) }));
    void apiClient.tasks.update(id, { status: toApiTaskStatus(status) }).catch(() => undefined);
  },
  deleteTask: (id) =>
    void (async () => {
      const response = await apiClient.tasks.delete(id);
      if (response.success) {
        set((s) => ({ tasks: s.tasks.filter((task) => task.id !== id) }));
      }
    })(),

  vendors: [],
  addVendor: (vendor) => {
    const localId = uid("vendor");
    set((s) => ({ vendors: [...s.vendors, { ...vendor, id: localId }] }));
    void (async () => {
      const response = await apiClient.vendors.create(vendor.eventId, {
        name: vendor.name,
        category: toApiVendorCategory(vendor.category),
        contact_name: vendor.contactName ?? null,
        contact_phone: vendor.phone ?? null,
        contact_email: vendor.email ?? null,
        quoted_price: vendor.estimatedCost,
        agreed_price: vendor.actualCost ?? 0,
        status: toApiVendorStatus(vendor.status),
        booking_date: vendor.bookingDate ?? null,
        notes: vendor.notes ?? null,
      });
      if (response.success && response.data) {
        const created = toDisplayVendor(response.data);
        set((s) => ({ vendors: s.vendors.map((item) => (item.id === localId ? created : item)) }));
      }
    })();
  },
  updateVendor: (id, patch) => {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.category !== undefined) payload.category = toApiVendorCategory(patch.category);
    if (patch.contactName !== undefined) payload.contact_name = patch.contactName;
    if (patch.phone !== undefined) payload.contact_phone = patch.phone;
    if (patch.email !== undefined) payload.contact_email = patch.email;
    if (patch.estimatedCost !== undefined) payload.quoted_price = patch.estimatedCost;
    if (patch.actualCost !== undefined) payload.agreed_price = patch.actualCost;
    if (patch.status !== undefined) payload.status = toApiVendorStatus(patch.status);
    if (patch.bookingDate !== undefined) payload.booking_date = patch.bookingDate;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    void (async () => {
      const response = await apiClient.vendors.update(id, payload);
      if (response.success && response.data) {
        const updated = toDisplayVendor(response.data);
        set((s) => ({ vendors: s.vendors.map((vendor) => (vendor.id === id ? updated : vendor)) }));
      }
    })();
  },
  setVendorStatus: (id, status) => {
    set((s) => ({ vendors: s.vendors.map((vendor) => (vendor.id === id ? { ...vendor, status } : vendor)) }));
    void apiClient.vendors.update(id, { status: toApiVendorStatus(status) }).catch(() => undefined);
  },
  deleteVendor: (id) =>
    void (async () => {
      const response = await apiClient.vendors.delete(id);
      if (response.success) {
        set((s) => ({ vendors: s.vendors.filter((vendor) => vendor.id !== id) }));
      }
    })(),

  guests: [],
  addGuest: (guest) => {
    const localId = uid("g");
    set((s) => ({ guests: [...s.guests, { ...guest, id: localId }] }));
    void (async () => {
      const response = await apiClient.guests.create(guest.eventId, {
        name: guest.name,
        group_name: guest.group ?? null,
        phone: guest.phone ?? null,
        email: guest.email ?? null,
        rsvp_status: toApiRsvp(guest.rsvp),
        meal_preference: guest.mealPreference ?? null,
        special_requirements: guest.specialRequirements ?? null,
        notes: guest.notes ?? null,
        plus_one: Boolean(guest.plusOnes),
      });
      if (response.success && response.data) {
        const created = toDisplayGuest(response.data);
        set((s) => ({ guests: s.guests.map((item) => (item.id === localId ? created : item)) }));
      }
    })();
  },
  updateGuest: (id, patch) => {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.group !== undefined) payload.group_name = patch.group;
    if (patch.phone !== undefined) payload.phone = patch.phone;
    if (patch.email !== undefined) payload.email = patch.email;
    if (patch.rsvp !== undefined) payload.rsvp_status = toApiRsvp(patch.rsvp);
    if (patch.mealPreference !== undefined) payload.meal_preference = patch.mealPreference;
    if (patch.specialRequirements !== undefined) payload.special_requirements = patch.specialRequirements;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    if (patch.plusOnes !== undefined) payload.plus_one = Boolean(patch.plusOnes);
    void (async () => {
      const response = await apiClient.guests.update(id, payload);
      if (response.success && response.data) {
        const updated = toDisplayGuest(response.data);
        set((s) => ({ guests: s.guests.map((guest) => (guest.id === id ? updated : guest)) }));
      }
    })();
  },
  setRsvp: (id, rsvp) => {
    set((s) => ({ guests: s.guests.map((guest) => (guest.id === id ? { ...guest, rsvp } : guest)) }));
    void apiClient.guests.update(id, { rsvp_status: toApiRsvp(rsvp) }).catch(() => undefined);
  },
  deleteGuest: (id) =>
    void (async () => {
      const response = await apiClient.guests.delete(id);
      if (response.success) {
        set((s) => ({ guests: s.guests.filter((guest) => guest.id !== id) }));
      }
    })(),

  expenses: [],
  addExpense: (expense) => {
    const localId = uid("exp");
    set((s) => ({ expenses: [...s.expenses, { ...expense, id: localId }] }));
    void (async () => {
      const response = await apiClient.expenses.create(expense.eventId, {
        description: expense.description,
        planned_amount: expense.plannedAmount,
        actual_amount: expense.actualAmount,
        expense_date: expense.date,
        notes: expense.notes ?? null,
      });
      if (response.success && response.data) {
        const created = toDisplayExpense(response.data);
        set((s) => ({ expenses: s.expenses.map((item) => (item.id === localId ? created : item)) }));
      }
    })();
  },
  updateExpense: (id, patch) => {
    const payload: Record<string, unknown> = {};
    if (patch.category !== undefined) payload.category = patch.category;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.plannedAmount !== undefined) payload.planned_amount = patch.plannedAmount;
    if (patch.actualAmount !== undefined) payload.actual_amount = patch.actualAmount;
    if (patch.date !== undefined) payload.expense_date = patch.date;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    void (async () => {
      const response = await apiClient.expenses.update(id, payload);
      if (response.success && response.data) {
        const updated = toDisplayExpense(response.data);
        set((s) => ({ expenses: s.expenses.map((expense) => (expense.id === id ? updated : expense)) }));
      }
    })();
  },
  deleteExpense: (id) =>
    void (async () => {
      const response = await apiClient.expenses.delete(id);
      if (response.success) {
        set((s) => ({ expenses: s.expenses.filter((expense) => expense.id !== id) }));
      }
    })(),

  milestones: [],
  addMilestone: (m) => {
    const localId = uid("ms");
    set((s) => ({ milestones: [...s.milestones, { ...m, id: localId }] }));
    void (async () => {
      const response = await apiClient.timeline.create(m.eventId, {
        title: m.title,
        milestone_date: m.date,
        description: m.description ?? null,
        status: m.completed ? "Completed" : "Pending",
      });
      if (response.success && response.data) {
        const created = toDisplayMilestone(response.data);
        set((s) => ({ milestones: s.milestones.map((item) => (item.id === localId ? created : item)) }));
      }
    })();
  },
  toggleMilestone: (id) => {
    const item = get().milestones.find((milestone) => milestone.id === id);
    if (!item) return;
    const nextCompleted = !item.completed;
    set((s) => ({ milestones: s.milestones.map((milestone) => (milestone.id === id ? { ...milestone, completed: nextCompleted } : milestone)) }));
    void apiClient.timeline.update(id, { status: nextCompleted ? "Completed" : "Pending" }).catch(() => undefined);
  },
  deleteMilestone: (id) =>
    void (async () => {
      const response = await apiClient.timeline.delete(id);
      if (response.success) {
        set((s) => ({ milestones: s.milestones.filter((milestone) => milestone.id !== id) }));
      }
    })(),

  schedule: [],
  addScheduleItem: (item) => {
    const localId = uid("sch");
    set((s) => ({ schedule: [...s.schedule, { ...item, id: localId }] }));
    void (async () => {
      const response = await apiClient.schedule.create(item.eventId, {
        activity: item.title,
        start_time: item.time,
        end_time: item.endTime ?? null,
        description: item.description ?? null,
        location: item.location ?? null,
        responsible_person: item.owner ?? null,
        status: item.status,
      });
      if (response.success && response.data) {
        const created = toDisplaySchedule(response.data);
        set((s) => ({ schedule: s.schedule.map((entry) => (entry.id === localId ? created : entry)) }));
      }
    })();
  },
  updateScheduleItem: (id, patch) => {
    const payload: Record<string, unknown> = {};
    if (patch.time !== undefined) payload.start_time = patch.time;
    if (patch.endTime !== undefined) payload.end_time = patch.endTime;
    if (patch.title !== undefined) payload.activity = patch.title;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.location !== undefined) payload.location = patch.location;
    if (patch.owner !== undefined) payload.responsible_person = patch.owner;
    if (patch.status !== undefined) payload.status = patch.status;
    void (async () => {
      const response = await apiClient.schedule.update(id, payload);
      if (response.success && response.data) {
        const updated = toDisplaySchedule(response.data);
        set((s) => ({ schedule: s.schedule.map((item) => (item.id === id ? updated : item)) }));
      }
    })();
  },
  deleteScheduleItem: (id) =>
    void (async () => {
      const response = await apiClient.schedule.delete(id);
      if (response.success) {
        set((s) => ({ schedule: s.schedule.filter((item) => item.id !== id) }));
      }
    })(),

  notifications: [],
  markNotificationRead: (id) => {
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
    void apiClient.notifications.markRead(id).catch(() => undefined);
  },
  markAllNotificationsRead: () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    void apiClient.notifications.markAllRead().catch(() => undefined);
  },
  addNotification: (n) =>
    set((s) => ({
      notifications: [{ id: uid("n"), ...n, timestamp: new Date().toISOString(), read: false }, ...s.notifications],
    })),

  chatMessages: {},
  sendChatMessage: async (eventId, content) => {
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
    await generateResponseForEvent(eventId, content, get, set);
  },
  retryLastMessage: async (eventId) => {
    const messages = get().chatMessages[eventId] ?? [];
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) {
      throw new Error("No message to retry");
    }
    await generateResponseForEvent(eventId, lastUserMsg.content, get, set);
  },
  clearChat: (eventId) =>
    set((s) => ({
      chatMessages: { ...s.chatMessages, [eventId]: [] },
    })),

  initAuth: async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        set({ isAuthed: true, authLoading: false, user: { id: user.id, name: fullName, email: user.email || "" } });
        await get().loadEvents();
      } else {
        set({ isAuthed: false, authLoading: false, user: null });
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      set({ isAuthed: false, authLoading: false, user: null });
    }

    onAuthStateChange((event, session) => {
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User";
        set({
          isAuthed: true,
          authLoading: false,
          user: { id: session.user.id, name: fullName, email: session.user.email || "" },
        });
        void get().loadEvents();
      } else if (event === "SIGNED_OUT") {
        set({
          isAuthed: false,
          authLoading: false,
          user: null,
          route: { kind: "public", view: "home" },
          events: [],
          tasks: [],
          vendors: [],
          guests: [],
          expenses: [],
          milestones: [],
          schedule: [],
          notifications: [],
          currentEventId: null,
        });
      }
    });
  },

  login: (email, name, id) =>
    set({
      isAuthed: true,
      authLoading: false,
      user: { id: id || uid("usr"), name: name || email.split("@")[0] || "User", email },
      route: { kind: "app", view: "dashboard" },
    }),
  register: (name, email, id) =>
    set({
      isAuthed: true,
      authLoading: false,
      user: { id: id || uid("usr"), name, email },
      route: { kind: "onboarding", view: "onboarding_welcome" },
    }),
  logout: async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
    set({
      isAuthed: false,
      authLoading: false,
      user: null,
      events: [],
      tasks: [],
      vendors: [],
      guests: [],
      expenses: [],
      milestones: [],
      schedule: [],
      notifications: [],
      currentEventId: null,
      route: { kind: "public", view: "home" },
    });
  },
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
    (task) => task.status !== "completed" && new Date(task.dueDate).getTime() < Date.now()
  );

  if (msg.includes("priorit")) {
    const next = tasks
      .filter((task) => task.status !== "completed")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5)
      .map((task) => `- ${task.title} (due ${task.dueDate})`)
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
    const list = overdue.map((task) => `- ${task.title} (was due ${task.dueDate})`).join("\n");
    return `These tasks are overdue for ${event.name}:\n\n${list}\n\nRecommend reassigning owners and moving due dates realistically. Want me to suggest revised dates?`;
  }

  if (msg.includes("checklist") || msg.includes("7-day") || msg.includes("seven")) {
    return `Here is a focused 7-day checklist for ${event.name}:\n\n1. Confirm all vendor arrival times in writing.\n2. Final headcount to caterer.\n3. Final seating chart and table cards printed.\n4. Emergency kit packed.\n5. Brief family on event-day responsibilities.\n6. Confirm transport pickup times for guests.\n7. Rest well the night before.`;
  }

  return `I am tracking ${event.name} scheduled for ${event.date}. I can help you prioritize tasks, review budget trade-offs, surface overdue items, and prepare a final week checklist.`;
}

async function generateResponseForEvent(
  eventId: string,
  content: string,
  get: () => AppState,
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void
): Promise<void> {
  try {
    const apiResponse = await apiClient.ai.chat(eventId, content);
    if (apiResponse.success && apiResponse.data) {
      set((state) => ({
        chatMessages: {
          ...state.chatMessages,
          [eventId]: [
            ...(state.chatMessages[eventId] ?? []),
            {
              id: uid("msg"),
              role: "assistant",
              content: apiResponse.data?.response ?? "",
              timestamp: new Date().toISOString(),
              isAiGenerated: true,
            },
          ],
        },
      }));
      return;
    }

    const fallbackEvent = get().events.find((event) => event.id === eventId);
    const fallbackTasks = get().tasks.filter((task) => task.eventId === eventId);
    const response = generateAssistantResponse(content, fallbackEvent, fallbackTasks);

    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [eventId]: [
          ...(state.chatMessages[eventId] ?? []),
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
  } catch (error) {
    console.error("AI fallback failed:", error);
    const fallbackEvent = get().events.find((event) => event.id === eventId);
    const fallbackTasks = get().tasks.filter((task) => task.eventId === eventId);
    const response = generateAssistantResponse(content, fallbackEvent, fallbackTasks);

    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [eventId]: [
          ...(state.chatMessages[eventId] ?? []),
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
  }
}
