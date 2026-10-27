import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  serverError,
} from '@/lib/api/response';

/**
 * Reads a value from either camelCase or snake_case key, falling back to undefined.
 */
function pick<T>(record: Record<string, unknown>, keys: readonly string[]): T | undefined {
  for (const key of keys) {
    if (key in record) return record[key] as T;
  }
  return undefined;
}

function asRecord(v: unknown): Record<string, unknown> {
  return (v as Record<string, unknown>) ?? {};
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { planId } = await params;

    // Verify plan exists and belongs to user
    const { data: stagedPlan, error: planErr } = await auth.supabase
      .from('ai_generated_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', auth.user.id)
      .single();

    if (planErr || !stagedPlan) {
      return notFound('Generated plan not found.');
    }

    // Verify parent event ownership
    const event = await verifyEventOwnership(auth.supabase, stagedPlan.event_id, auth.user.id);
    if (!event) {
      return notFound('Parent event not found.');
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional; fallback to staged plan_data if no custom edits passed
    }

    const planData = stagedPlan.plan_data as Record<string, unknown>;

    const tasksToInsert = pick<unknown[]>(body, ['tasks']) ?? pick<unknown[]>(planData, ['tasks']) ?? [];
    const milestonesToInsert = pick<unknown[]>(body, ['milestones']) ?? pick<unknown[]>(planData, ['milestones']) ?? [];
    const scheduleToInsert =
      pick<unknown[]>(body, ['eventDaySchedule', 'event_day_schedule']) ??
      pick<unknown[]>(planData, ['eventDaySchedule', 'event_day_schedule']) ??
      [];
    const budgetCategoriesToInsert =
      pick<unknown[]>(body, ['budgetCategories', 'budget_categories']) ??
      pick<unknown[]>(planData, ['budgetCategories', 'budget_categories']) ??
      [];

    let tasksCreated = 0;
    let milestonesCreated = 0;
    let scheduleItemsCreated = 0;
    let categoriesCreated = 0;

    // 1. Insert budget categories if none exist yet for this event
    if (Array.isArray(budgetCategoriesToInsert) && budgetCategoriesToInsert.length > 0) {
      const categoryRows = budgetCategoriesToInsert.map((v) => {
        const item = asRecord(v);
        return {
          event_id: stagedPlan.event_id,
          name: pick<string>(item, ['category', 'name']) ?? '',
          planned_amount: pick<number>(item, ['suggested_amount', 'suggestedAmount', 'planned_amount']) ?? 0,
        };
      });

      const { data: insertedCategories } = await auth.supabase
        .from('budget_categories')
        .upsert(categoryRows, { onConflict: 'event_id,name' })
        .select('id');
      categoriesCreated = insertedCategories ? insertedCategories.length : 0;
    }

    // 2. Insert tasks
    if (Array.isArray(tasksToInsert) && tasksToInsert.length > 0) {
      const taskRows = tasksToInsert.map((v) => {
        const item = asRecord(v);
        const priority = pick<string>(item, ['priority']) ?? 'Medium';
        const validPriorities: readonly string[] = ['Low', 'Medium', 'High', 'Critical'];
        const taskPriority = validPriorities.includes(priority) ? (priority as 'Low' | 'Medium' | 'High' | 'Critical') : 'Medium';

        return {
          event_id: stagedPlan.event_id,
          title: pick<string>(item, ['title']) ?? '',
          description: pick<string>(item, ['description']) ?? null,
          category: pick<string>(item, ['category']) ?? null,
          priority: taskPriority,
          status: 'Not Started' as const,
          due_date: pick<string>(item, ['suggested_due_date', 'suggestedDueDate', 'due_date']) ?? null,
        };
      });

      const { data: insertedTasks } = await auth.supabase
        .from('tasks')
        .insert(taskRows)
        .select('id');
      tasksCreated = insertedTasks ? insertedTasks.length : 0;
    }

    // 3. Insert milestones
    if (Array.isArray(milestonesToInsert) && milestonesToInsert.length > 0) {
      const milestoneRows = milestonesToInsert.map((v) => {
        const item = asRecord(v);
        return {
          event_id: stagedPlan.event_id,
          title: pick<string>(item, ['title']) ?? '',
          milestone_date:
            pick<string>(item, ['suggested_date', 'suggestedDate', 'date', 'milestone_date']) ??
            event.event_date,
          description: pick<string>(item, ['description']) ?? null,
          status: 'Pending' as const,
        };
      });

      const { data: insertedMilestones } = await auth.supabase
        .from('event_milestones')
        .insert(milestoneRows)
        .select('id');
      milestonesCreated = insertedMilestones ? insertedMilestones.length : 0;
    }

    // 4. Insert schedule items
    if (Array.isArray(scheduleToInsert) && scheduleToInsert.length > 0) {
      const scheduleRows = scheduleToInsert.map((v, idx) => {
        const item = asRecord(v);
        return {
          event_id: stagedPlan.event_id,
          activity: pick<string>(item, ['activity']) ?? '',
          start_time: pick<string>(item, ['start_time', 'time']) ?? '10:00',
          end_time: pick<string>(item, ['end_time']) ?? null,
          description: pick<string>(item, ['description']) ?? null,
          sort_order: idx + 1,
        };
      });

      const { data: insertedSchedule } = await auth.supabase
        .from('event_schedule_items')
        .insert(scheduleRows)
        .select('id');
      scheduleItemsCreated = insertedSchedule ? insertedSchedule.length : 0;
    }

    // 5. Create in-app notification
    await auth.supabase.from('notifications').insert({
      user_id: auth.user.id,
      event_id: stagedPlan.event_id,
      type: 'ai_plan_accepted',
      title: 'AI Plan Accepted',
      message: `Successfully imported plan into "${event.name}". Added ${tasksCreated} tasks, ${milestonesCreated} milestones, ${categoriesCreated} budget categories, and ${scheduleItemsCreated} schedule items.`,
      is_read: false,
    });

    // 6. Update plan status to 'Accepted'
    await auth.supabase
      .from('ai_generated_plans')
      .update({ status: 'Accepted' })
      .eq('id', planId)
      .eq('user_id', auth.user.id);

    return apiSuccess(
      {
        tasksCreated,
        milestonesCreated,
        categoriesCreated,
        scheduleItemsCreated,
      },
      201
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error accepting plan.', message);
  }
}

