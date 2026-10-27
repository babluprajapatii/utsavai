import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface EventContextSummary {
  eventId: string;
  name: string;
  type: string;
  eventDate: string;
  daysRemaining: number;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  guestCount: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilizationPct: number;
  currency: string;
  theme: string | null;
  style: string | null;
  priorities: string[];
  specialRequirements: string | null;
  budgetCategories: Array<{ name: string; plannedAmount: number }>;
  tasksSummary: {
    total: number;
    completed: number;
    overdue: number;
    pendingHighPriority: string[];
  };
  vendorsSummary: {
    total: number;
    booked: number;
    unbookedCategories: string[];
  };
  guestsSummary: {
    totalInvited: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContextPayload {
  eventContext: EventContextSummary;
  recentTurns: ConversationTurn[];
}

/**
 * Builds a sanitized, PII-free context snapshot of the event directly from PostgreSQL.
 * Strict multi-tenant isolation: every query is scoped by event_id AND user_id.
 */
export async function buildEventPlanningContext(
  supabase: SupabaseClient<Database>,
  eventId: string,
  userId: string
): Promise<EventContextSummary | null> {
  // 1. Fetch event metadata
  const { data: event, error: eventErr } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', userId)
    .single();

  if (eventErr || !event) {
    return null;
  }

  // 2. Fetch event preferences
  const { data: preferences } = await supabase
    .from('event_preferences')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();

  // 3. Fetch budget categories
  const { data: categories } = await supabase
    .from('budget_categories')
    .select('name, planned_amount')
    .eq('event_id', eventId);

  // 4. Fetch expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('actual_amount, category_id')
    .eq('event_id', eventId);

  // 5. Fetch tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date')
    .eq('event_id', eventId);

  // 6. Fetch vendors
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, category, status')
    .eq('event_id', eventId);

  // 7. Fetch guests summary (count aggregations only — ZERO PII)
  const { data: guests } = await supabase
    .from('guests')
    .select('rsvp_status')
    .eq('event_id', eventId);

  // Calculations
  const today = new Date();
  const eventDateObj = new Date(event.event_date);
  const diffTime = eventDateObj.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const totalBudget = Number(event.total_budget ?? 0);
  const totalSpent = (expenses ?? []).reduce(
    (sum, exp) => sum + Number(exp.actual_amount ?? 0),
    0
  );
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const budgetUtilizationPct =
    totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  // Tasks analytics
  const todayIso = today.toISOString().slice(0, 10);
  const taskList = tasks ?? [];
  const completedTasks = taskList.filter((t) => t.status === 'Completed').length;
  const overdueTasks = taskList.filter(
    (t) =>
      t.status !== 'Completed' &&
      t.due_date &&
      t.due_date < todayIso
  ).length;
  const pendingHighPriority = taskList
    .filter(
      (t) =>
        t.status !== 'Completed' &&
        (t.priority === 'High' || t.priority === 'Critical')
    )
    .slice(0, 5)
    .map((t) => t.title);

  // Vendors analytics
  const vendorList = vendors ?? [];
  const bookedVendors = vendorList.filter(
    (v) => v.status === 'Booked' || v.status === 'Completed'
  ).length;
  const bookedCategories = new Set<string>(
    vendorList
      .filter((v) => v.status === 'Booked' || v.status === 'Completed')
      .map((v) => v.category)
  );
  const standardCategories = ['Venue', 'Catering', 'Photography', 'Decoration'];
  const unbookedCategories = standardCategories.filter(
    (cat) => !bookedCategories.has(cat)
  );

  // Guests analytics
  const guestList = guests ?? [];
  const confirmedGuests = guestList.filter((g) => g.rsvp_status === 'Accepted').length;
  const pendingGuests = guestList.filter((g) => g.rsvp_status === 'Pending').length;
  const declinedGuests = guestList.filter((g) => g.rsvp_status === 'Declined').length;

  let prioritiesList: string[] = [];
  if (Array.isArray(preferences?.priorities)) {
    prioritiesList = preferences.priorities as string[];
  }

  return {
    eventId: event.id,
    name: event.name,
    type: event.type,
    eventDate: event.event_date,
    daysRemaining,
    startTime: event.start_time,
    endTime: event.end_time,
    location: event.location,
    guestCount: event.guest_count ?? 0,
    totalBudget,
    totalSpent,
    remainingBudget,
    budgetUtilizationPct,
    currency: event.currency || 'INR',
    theme: preferences?.theme || null,
    style: preferences?.style || null,
    priorities: prioritiesList,
    specialRequirements: preferences?.special_requirements || null,
    budgetCategories: (categories ?? []).map((c) => ({
      name: c.name,
      plannedAmount: Number(c.planned_amount ?? 0),
    })),
    tasksSummary: {
      total: taskList.length,
      completed: completedTasks,
      overdue: overdueTasks,
      pendingHighPriority,
    },
    vendorsSummary: {
      total: vendorList.length,
      booked: bookedVendors,
      unbookedCategories,
    },
    guestsSummary: {
      totalInvited: guestList.length,
      confirmed: confirmedGuests,
      pending: pendingGuests,
      declined: declinedGuests,
    },
  };
}

/**
 * Builds conversational chat context combining event metadata and bounded 6-turn history.
 */
export async function buildChatConversationContext(
  supabase: SupabaseClient<Database>,
  eventId: string,
  userId: string,
  conversationId?: string
): Promise<ChatContextPayload | null> {
  const eventContext = await buildEventPlanningContext(supabase, eventId, userId);
  if (!eventContext) {
    return null;
  }

  const recentTurns: ConversationTurn[] = [];

  if (conversationId) {
    // Fetch last 6 messages ordered chronologically
    const { data: messages } = await supabase
      .from('ai_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(6);

    if (messages && messages.length > 0) {
      // Reverse to chronological order (oldest first)
      const sorted = [...messages].reverse();
      for (const m of sorted) {
        if (m.role === 'user' || m.role === 'assistant') {
          recentTurns.push({
            role: m.role,
            content: m.content,
          });
        }
      }
    }
  }

  return {
    eventContext,
    recentTurns,
  };
}
