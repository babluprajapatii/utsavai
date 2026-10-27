import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  serverError,
} from '@/lib/api/response';

export async function GET(_request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch user events
    const { data: events, error: eventErr } = await auth.supabase
      .from('events')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('event_date', { ascending: true });

    if (eventErr) {
      return serverError('Failed to fetch dashboard events.', eventErr.message);
    }

    const eventList = events ?? [];
    const eventIds = eventList.map((e) => e.id);

    // Compute upcoming events
    const upcomingEvents = eventList.slice(0, 5).map((e) => {
      const diffTime = new Date(e.event_date).getTime() - new Date(todayStr).getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return {
        id: e.id,
        name: e.name,
        event_date: e.event_date,
        type: e.type,
        status: e.status,
        daysRemaining,
      };
    });

    if (eventIds.length === 0) {
      return apiSuccess({
        upcomingEvents: [],
        eventSummaries: [],
        recentActivity: [],
        riskIndicators: [],
      });
    }

    // Fetch child items across all events
    const [tasksRes, expensesRes, guestsRes, vendorsRes] = await Promise.all([
      auth.supabase.from('tasks').select('*').in('event_id', eventIds),
      auth.supabase.from('expenses').select('*').in('event_id', eventIds),
      auth.supabase.from('guests').select('*').in('event_id', eventIds),
      auth.supabase.from('vendors').select('*').in('event_id', eventIds),
    ]);

    const allTasks = tasksRes.data ?? [];
    const allExpenses = expensesRes.data ?? [];
    const allGuests = guestsRes.data ?? [];
    const allVendors = vendorsRes.data ?? [];

    const eventSummaries = eventList.map((e) => {
      const eTasks = allTasks.filter((t) => t.event_id === e.id);
      const eExpenses = allExpenses.filter((exp) => exp.event_id === e.id);
      const eGuests = allGuests.filter((g) => g.event_id === e.id);
      const eVendors = allVendors.filter((v) => v.event_id === e.id);

      const totalBudget = Number(e.total_budget ?? 0);
      const totalSpent = eExpenses.reduce((sum, exp) => sum + Number(exp.actual_amount ?? 0), 0);
      const budgetUtilization =
        totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0;

      let budgetStatus: 'normal' | 'warning' | 'critical' | 'over_budget' = 'normal';
      if (totalSpent > totalBudget && totalBudget > 0) {
        budgetStatus = 'over_budget';
      } else if (budgetUtilization >= 90) {
        budgetStatus = 'critical';
      } else if (budgetUtilization >= 80) {
        budgetStatus = 'warning';
      }

      const completedTasks = eTasks.filter((t) => t.status === 'Completed').length;
      const overdueTasks = eTasks.filter(
        (t) => t.status !== 'Completed' && t.due_date && t.due_date < todayStr
      ).length;

      const acceptedGuests = eGuests.filter((g) => g.rsvp_status === 'Accepted').length;
      const bookedVendors = eVendors.filter((v) => v.status === 'Booked').length;

      const upcomingDeadlines = eTasks
        .filter((t) => t.status !== 'Completed' && t.due_date && t.due_date >= todayStr)
        .slice(0, 3)
        .map((t) => ({ id: t.id, title: t.title, due_date: t.due_date }));

      return {
        event_id: e.id,
        event_name: e.name,
        budgetUtilization,
        budgetStatus,
        totalTasks: eTasks.length,
        completedTasks,
        overdueTasks,
        totalGuests: eGuests.length,
        acceptedGuests,
        totalVendors: eVendors.length,
        bookedVendors,
        upcomingDeadlines,
      };
    });

    const riskIndicators = eventSummaries
      .filter((s) => s.budgetStatus !== 'normal' || s.overdueTasks > 0)
      .map((s) => ({
        event_id: s.event_id,
        event_name: s.event_name,
        type: s.budgetStatus !== 'normal' ? 'budget_risk' : 'task_risk',
        message:
          s.budgetStatus !== 'normal'
            ? `Budget utilization reached ${s.budgetUtilization}% (${s.budgetStatus})`
            : `${s.overdueTasks} overdue tasks require attention`,
      }));

    return apiSuccess({
      upcomingEvents,
      eventSummaries,
      recentActivity: allTasks.slice(0, 5),
      riskIndicators,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error compiling dashboard.', message);
  }
}

