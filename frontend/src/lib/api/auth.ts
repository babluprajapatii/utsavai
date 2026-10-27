import { createClient as createServerClient } from '@/lib/supabase/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface AuthContext {
  user: User;
  supabase: SupabaseClient<Database>;
}

/**
 * Resolves the authenticated user from Supabase Auth session.
 * Never trusts client-supplied user identifiers.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      // In development environments with explicit dev mock user configured
      if (process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_USER_ID) {
        return {
          user: {
            id: process.env.DEV_MOCK_USER_ID,
            email: 'dev@utsavai.local',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as User,
          supabase,
        };
      }
      return null;
    }

    return { user, supabase };
  } catch {
    return null;
  }
}

/**
 * Verifies that the specified event belongs to the authenticated user.
 * Returns the event row if verified, or null if not found / unauthorized.
 */
export async function verifyEventOwnership(
  supabase: SupabaseClient<Database>,
  eventId: string,
  userId: string
) {
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', userId)
    .single();

  if (error || !event) {
    return null;
  }

  return event;
}

/**
 * Verifies that a task belongs to an event owned by the authenticated user.
 */
export async function verifyTaskOwnership(
  supabase: SupabaseClient<Database>,
  taskId: string,
  userId: string
) {
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, events!inner(user_id)')
    .eq('id', taskId)
    .single();

  if (error || !task) {
    return null;
  }

  const parentEvent = task.events as unknown as { user_id: string } | null;
  if (!parentEvent || parentEvent.user_id !== userId) {
    return null;
  }

  return task;
}

/**
 * Verifies that an expense belongs to an event owned by the authenticated user.
 */
export async function verifyExpenseOwnership(
  supabase: SupabaseClient<Database>,
  expenseId: string,
  userId: string
) {
  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*, events!inner(user_id)')
    .eq('id', expenseId)
    .single();

  if (error || !expense) {
    return null;
  }

  const parentEvent = expense.events as unknown as { user_id: string } | null;
  if (!parentEvent || parentEvent.user_id !== userId) {
    return null;
  }

  return expense;
}

/**
 * Verifies that a vendor belongs to an event owned by the authenticated user.
 */
export async function verifyVendorOwnership(
  supabase: SupabaseClient<Database>,
  vendorId: string,
  userId: string
) {
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*, events!inner(user_id)')
    .eq('id', vendorId)
    .single();

  if (error || !vendor) {
    return null;
  }

  const parentEvent = vendor.events as unknown as { user_id: string } | null;
  if (!parentEvent || parentEvent.user_id !== userId) {
    return null;
  }

  return vendor;
}

/**
 * Verifies that a guest belongs to an event owned by the authenticated user.
 */
export async function verifyGuestOwnership(
  supabase: SupabaseClient<Database>,
  guestId: string,
  userId: string
) {
  const { data: guest, error } = await supabase
    .from('guests')
    .select('*, events!inner(user_id)')
    .eq('id', guestId)
    .single();

  if (error || !guest) {
    return null;
  }

  const parentEvent = guest.events as unknown as { user_id: string } | null;
  if (!parentEvent || parentEvent.user_id !== userId) {
    return null;
  }

  return guest;
}

/**
 * Verifies that a milestone belongs to an event owned by the authenticated user.
 */
export async function verifyMilestoneOwnership(
  supabase: SupabaseClient<Database>,
  milestoneId: string,
  userId: string
) {
  const { data: milestone, error } = await supabase
    .from('event_milestones')
    .select('*, events!inner(user_id)')
    .eq('id', milestoneId)
    .single();

  if (error || !milestone) {
    return null;
  }

  const parentEvent = milestone.events as unknown as { user_id: string } | null;
  if (!parentEvent || parentEvent.user_id !== userId) {
    return null;
  }

  return milestone;
}

/**
 * Verifies that a schedule item belongs to an event owned by the authenticated user.
 */
export async function verifyScheduleOwnership(
  supabase: SupabaseClient<Database>,
  scheduleId: string,
  userId: string
) {
  const { data: scheduleItem, error } = await supabase
    .from('event_schedule_items')
    .select('*, events!inner(user_id)')
    .eq('id', scheduleId)
    .single();

  if (error || !scheduleItem) {
    return null;
  }

  const parentEvent = scheduleItem.events as unknown as { user_id: string } | null;
  if (!parentEvent || parentEvent.user_id !== userId) {
    return null;
  }

  return scheduleItem;
}

/**
 * Verifies that a budget category belongs to an event owned by the authenticated user.
 */
export async function verifyCategoryOwnership(
  supabase: SupabaseClient<Database>,
  categoryId: string,
  userId: string
) {
  const { data: category, error } = await supabase
    .from('budget_categories')
    .select('*, events!inner(user_id)')
    .eq('id', categoryId)
    .single();

  if (error || !category) {
    return null;
  }

  const parentEvent = category.events as unknown as { user_id: string } | null;
  if (!parentEvent || parentEvent.user_id !== userId) {
    return null;
  }

  return category;
}
