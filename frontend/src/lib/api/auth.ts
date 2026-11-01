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
      return null;
    }

    return { user, supabase };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[getAuthContext] Failed to resolve authenticated user:', message);
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
 * Generic ownership verifier for child resources (tasks, expenses, vendors,
 * guests, milestones, schedule items, budget categories).
 *
 * Uses a foreign-key join through `events!inner(user_id)` so the ownership
 * check is enforced at the database level in a single query. Returns the
 * resource row if it belongs to the authenticated user, otherwise null.
 */
async function verifyChildOwnership(
  supabase: SupabaseClient<Database>,
  resourceId: string,
  tableName: keyof Database['public']['Tables'],
  userId: string
) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*, events!inner(user_id)')
    .eq('id', resourceId)
    .single();

  if (error || !data) {
    return null;
  }

  const parentEvent = (data as unknown as { events: { user_id: string } | null }).events;
  if (!parentEvent || parentEvent.user_id !== userId) {
    return null;
  }

  return data;
}

/**
 * Verifies that a task belongs to an event owned by the authenticated user.
 */
export async function verifyTaskOwnership(
  supabase: SupabaseClient<Database>,
  taskId: string,
  userId: string
) {
  return await verifyChildOwnership(supabase, taskId, 'tasks', userId);
}

/**
 * Verifies that an expense belongs to an event owned by the authenticated user.
 */
export async function verifyExpenseOwnership(
  supabase: SupabaseClient<Database>,
  expenseId: string,
  userId: string
) {
  return await verifyChildOwnership(supabase, expenseId, 'expenses', userId);
}

/**
 * Verifies that a vendor belongs to an event owned by the authenticated user.
 */
export async function verifyVendorOwnership(
  supabase: SupabaseClient<Database>,
  vendorId: string,
  userId: string
) {
  return await verifyChildOwnership(supabase, vendorId, 'vendors', userId);
}

/**
 * Verifies that a guest belongs to an event owned by the authenticated user.
 */
export async function verifyGuestOwnership(
  supabase: SupabaseClient<Database>,
  guestId: string,
  userId: string
) {
  return await verifyChildOwnership(supabase, guestId, 'guests', userId);
}

/**
 * Verifies that a milestone belongs to an event owned by the authenticated user.
 */
export async function verifyMilestoneOwnership(
  supabase: SupabaseClient<Database>,
  milestoneId: string,
  userId: string
) {
  return await verifyChildOwnership(supabase, milestoneId, 'event_milestones', userId);
}

/**
 * Verifies that a schedule item belongs to an event owned by the authenticated user.
 */
export async function verifyScheduleOwnership(
  supabase: SupabaseClient<Database>,
  scheduleId: string,
  userId: string
) {
  return await verifyChildOwnership(supabase, scheduleId, 'event_schedule_items', userId);
}

/**
 * Verifies that a budget category belongs to an event owned by the authenticated user.
 */
export async function verifyCategoryOwnership(
  supabase: SupabaseClient<Database>,
  categoryId: string,
  userId: string
) {
  return await verifyChildOwnership(supabase, categoryId, 'budget_categories', userId);
}