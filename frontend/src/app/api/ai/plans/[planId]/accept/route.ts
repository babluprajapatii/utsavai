import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';

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

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional; fallback to staged plan_data if no custom edits passed
      body = {};
    }

    const planData = stagedPlan.plan_data as Record<string, any>;
    const tasksToInsert = body.tasks ?? planData?.tasks ?? [];
    const milestonesToInsert = body.milestones ?? planData?.milestones ?? [];
    const scheduleToInsert =
      body.eventDaySchedule ??
      body.event_day_schedule ??
      planData?.eventDaySchedule ??
      planData?.event_day_schedule ??
      [];
    const budgetCategoriesToInsert =
      body.budgetCategories ??
      body.budget_categories ??
      planData?.budgetCategories ??
      planData?.budget_categories ??
      [];

    let tasksCreated = 0;
    let milestonesCreated = 0;
    let scheduleItemsCreated = 0;
    let categoriesCreated = 0;

    // 1. Insert budget categories if none exist yet for this event
    if (Array.isArray(budgetCategoriesToInsert) && budgetCategoriesToInsert.length > 0) {
      const categoryRows = budgetCategoriesToInsert.map((c: any) => ({
        event_id: stagedPlan.event_id,
        name: c.category || c.name,
        planned_amount: c.suggested_amount || c.suggestedAmount || c.planned_amount || 0,
      }));

      // Use upsert or insert with ignore on conflict
      const { data: insertedCategories } = await auth.supabase
        .from('budget_categories')
        .upsert(categoryRows, { onConflict: 'event_id,name' })
        .select('id');
      categoriesCreated = insertedCategories ? insertedCategories.length : 0;
    }

    // 2. Insert tasks
    if (Array.isArray(tasksToInsert) && tasksToInsert.length > 0) {
      const taskRows = tasksToInsert.map((t: any) => ({
        event_id: stagedPlan.event_id,
        title: t.title,
        description: t.description || null,
        category: t.category || null,
        priority: t.priority || 'Medium',
        status: 'Not Started' as const,
        due_date: t.suggested_due_date || t.suggestedDueDate || t.due_date || null,
      }));

      const { data: insertedTasks } = await auth.supabase
        .from('tasks')
        .insert(taskRows)
        .select('id');
      tasksCreated = insertedTasks ? insertedTasks.length : 0;
    }

    // 3. Insert milestones
    if (Array.isArray(milestonesToInsert) && milestonesToInsert.length > 0) {
      const milestoneRows = milestonesToInsert.map((m: any) => ({
        event_id: stagedPlan.event_id,
        title: m.title,
        milestone_date: m.suggested_date || m.suggestedDate || m.date || m.milestone_date || event.event_date,
        description: m.description || null,
        status: 'Pending' as const,
      }));

      const { data: insertedMilestones } = await auth.supabase
        .from('event_milestones')
        .insert(milestoneRows)
        .select('id');
      milestonesCreated = insertedMilestones ? insertedMilestones.length : 0;
    }

    // 4. Insert schedule items
    if (Array.isArray(scheduleToInsert) && scheduleToInsert.length > 0) {
      const scheduleRows = scheduleToInsert.map((s: any, idx: number) => ({
        event_id: stagedPlan.event_id,
        activity: s.activity,
        start_time: s.start_time || s.time || '10:00',
        end_time: s.end_time || null,
        description: s.description || null,
        sort_order: idx + 1,
      }));

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

    // 5. Update plan status to 'Accepted'
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

