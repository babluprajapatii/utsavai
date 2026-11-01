import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { acceptPlanSchema } from '@/lib/api/validation';
import type { TaskStatus, TaskPriority } from '@/types/database';

interface RawPlanCategory {
  name: string;
  planned_amount?: number;
}

interface RawPlanTask {
  title: string;
  description?: string | null;
  category?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  suggested_due_date?: string | null;
  due_date?: string | null;
}

interface RawPlanMilestone {
  title: string;
  milestone_date?: string | null;
  suggested_date?: string | null;
  description?: string | null;
}

interface RawPlanScheduleItem {
  activity?: string;
  start_time?: string;
  end_time?: string | null;
  description?: string | null;
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = acceptPlanSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Invalid plan acceptance payload.', parsed.error.format());
    }

    const planData = parsed.data as unknown as Record<string, unknown>;

    let tasksInserted = 0;
    let milestonesInserted = 0;
    let scheduleItemsInserted = 0;
    let categoriesInserted = 0;

    // Insert budget categories (idempotent via unique constraint on event_id+name)
    if (Array.isArray(planData.budgetCategories)) {
      const categoryRows = (planData.budgetCategories as RawPlanCategory[]).map((cat) => ({
        event_id: event.id,
        name: cat.name,
        planned_amount: cat.planned_amount ?? 0,
      }));

      const { data: insertedCategories, error: catError } = await auth.supabase
        .from('budget_categories')
        .upsert(categoryRows, { onConflict: 'event_id,name' })
        .select('id');

      categoriesInserted = Array.isArray(insertedCategories) ? insertedCategories.length : 0;
      if (catError) {
        throw new Error(`Failed to insert budget categories: ${catError.message}`);
      }
    }

    // Insert tasks
    if (Array.isArray(planData.tasks)) {
      const taskRows = (planData.tasks as RawPlanTask[]).map((task) => ({
        event_id: event.id,
        title: task.title,
        description: task.description ?? null,
        category: task.category ?? null,
        priority: task.priority || 'Medium',
        status: task.status ?? 'Not Started',
        due_date: task.suggested_due_date ?? task.due_date ?? null,
      }));

      const { data: insertedTasks, error: taskError } = await auth.supabase
        .from('tasks')
        .insert(taskRows)
        .select('id');

      tasksInserted = Array.isArray(insertedTasks) ? insertedTasks.length : 0;
      if (taskError) {
        throw new Error(`Failed to insert tasks: ${taskError.message}`);
      }
    }

    // Insert milestones
    if (Array.isArray(planData.milestones)) {
      const milestoneRows = (planData.milestones as RawPlanMilestone[]).map((ms) => ({
        event_id: event.id,
        title: ms.title,
        milestone_date: ms.milestone_date ?? ms.suggested_date ?? new Date().toISOString().slice(0, 10),
        description: ms.description ?? '',
      }));

      const { data: insertedMilestones, error: milestoneError } = await auth.supabase
        .from('event_milestones')
        .insert(milestoneRows)
        .select('id');

      milestonesInserted = Array.isArray(insertedMilestones) ? insertedMilestones.length : 0;
      if (milestoneError) {
        throw new Error(`Failed to insert milestones: ${milestoneError.message}`);
      }
    }

    // Insert schedule items
    if (Array.isArray(planData.eventDaySchedule)) {
      const scheduleRows = (planData.eventDaySchedule as RawPlanScheduleItem[]).map((item, idx) => ({
        event_id: event.id,
        activity: item.activity ?? '',
        start_time: item.start_time ?? '10:00',
        end_time: item.end_time ?? null,
        description: item.description ?? null,
        sort_order: idx + 1,
      }));

      const { data: insertedSchedule, error: scheduleError } = await auth.supabase
        .from('event_schedule_items')
        .insert(scheduleRows)
        .select('id');

      scheduleItemsInserted = Array.isArray(insertedSchedule) ? insertedSchedule.length : 0;
      if (scheduleError) {
        throw new Error(`Failed to insert schedule items: ${scheduleError.message}`);
      }
    }

    // Create in-app notification for successful import
    await auth.supabase.from('notifications').insert({
      user_id: auth.user.id,
      event_id: event.id,
      type: 'ai_plan_accepted',
      title: `Plan imported successfully`,
      message: `Successfully imported plan into "${event.name}". Added ${tasksInserted} tasks, ${milestonesInserted} milestones, ${categoriesInserted} budget categories, and ${scheduleItemsInserted} schedule items.`,
      is_read: false,
    });

    // Update plan status to Accepted
    await auth.supabase
      .from('ai_generated_plans')
      .update({ status: 'Accepted' })
      .eq('id', planId)
      .eq('event_id', event.id);

    return apiSuccess(
      {
        tasksCreated: tasksInserted,
        milestonesCreated: milestonesInserted,
        categoriesCreated: categoriesInserted,
        scheduleItemsCreated: scheduleItemsInserted,
      },
      201
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error accepting plan.', message);
  }
}