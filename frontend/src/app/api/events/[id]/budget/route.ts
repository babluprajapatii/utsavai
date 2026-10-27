import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  serverError,
} from '@/lib/api/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { id } = await params;
    const event = await verifyEventOwnership(auth.supabase, id, auth.user.id);
    if (!event) {
      return notFound('Event not found.');
    }

    // Fetch all categories for this event
    const { data: categories, error: catError } = await auth.supabase
      .from('budget_categories')
      .select('*')
      .eq('event_id', id);

    if (catError) {
      return serverError('Failed to fetch budget categories.', catError.message);
    }

    // Fetch all expenses for this event
    const { data: expenses, error: expError } = await auth.supabase
      .from('expenses')
      .select('*')
      .eq('event_id', id);

    if (expError) {
      return serverError('Failed to fetch expenses.', expError.message);
    }

    const totalBudget = Number(event.total_budget ?? 0);
    const totalExpenses = (expenses ?? []).reduce(
      (sum, exp) => sum + Number(exp.actual_amount ?? 0),
      0
    );
    const remainingBudget = Math.max(0, totalBudget - totalExpenses);
    const utilizationPercentage =
      totalBudget > 0 ? Number(((totalExpenses / totalBudget) * 100).toFixed(1)) : 0;

    let status: 'normal' | 'warning' | 'critical' | 'over_budget' = 'normal';
    if (totalExpenses > totalBudget && totalBudget > 0) {
      status = 'over_budget';
    } else if (utilizationPercentage >= 90) {
      status = 'critical';
    } else if (utilizationPercentage >= 80) {
      status = 'warning';
    }

    // Build category map
    const categoryNameMap = new Map<string, string>();
    (categories ?? []).forEach((c) => categoryNameMap.set(c.id, c.name));

    const categoryTotals = new Map<string, number>();
    (expenses ?? []).forEach((exp) => {
      const catName = exp.category_id
        ? categoryNameMap.get(exp.category_id) ?? 'Uncategorized'
        : 'Uncategorized';
      const current = categoryTotals.get(catName) ?? 0;
      categoryTotals.set(catName, current + Number(exp.actual_amount ?? 0));
    });

    const byCategory = Array.from(categoryTotals.entries()).map(([category, total]) => ({
      category,
      total: Number(total.toFixed(2)),
      percentage_of_budget:
        totalBudget > 0 ? Number(((total / totalBudget) * 100).toFixed(1)) : 0,
    }));

    return apiSuccess({
      total_budget: totalBudget,
      total_expenses: Number(totalExpenses.toFixed(2)),
      remaining_budget: Number(remainingBudget.toFixed(2)),
      utilization_percentage: utilizationPercentage,
      status,
      currency: event.currency ?? 'INR',
      by_category: byCategory,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error calculating budget overview.', message);
  }
}

