import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { createExpenseSchema, paginationQuerySchema } from '@/lib/api/validation';

export async function GET(
  request: NextRequest,
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

    const { searchParams } = new URL(request.url);
    const parsedPagination = paginationQuerySchema.safeParse({
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    const { limit, offset } = parsedPagination.success
      ? parsedPagination.data
      : { limit: 50, offset: 0 };

    const categoryId = searchParams.get('category_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let query = auth.supabase
      .from('expenses')
      .select('*, budget_categories(name), vendors(name)', { count: 'exact' })
      .eq('event_id', id);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (dateFrom) {
      query = query.gte('expense_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('expense_date', dateTo);
    }

    const { data: expenses, error, count } = await query
      .order('expense_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return serverError('Failed to list expenses.', error.message);
    }

    const total = count ?? (expenses ? expenses.length : 0);
    const hasMore = offset + (expenses ? expenses.length : 0) < total;

    return apiSuccess(expenses ?? [], 200, {
      total,
      limit,
      offset,
      hasMore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing expenses.', message);
  }
}

export async function POST(
  request: NextRequest,
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = createExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Expense validation failed.', parsed.error.format());
    }

    // Verify vendor belongs to this event if vendor_id provided
    if (parsed.data.vendor_id) {
      const { data: v } = await auth.supabase
        .from('vendors')
        .select('id')
        .eq('id', parsed.data.vendor_id)
        .eq('event_id', id)
        .single();
      if (!v) {
        return badRequest('Referenced vendor does not belong to this event.');
      }
    }

    // Verify category belongs to this event if category_id provided
    if (parsed.data.category_id) {
      const { data: c } = await auth.supabase
        .from('budget_categories')
        .select('id')
        .eq('id', parsed.data.category_id)
        .eq('event_id', id)
        .single();
      if (!c) {
        return badRequest('Referenced category does not belong to this event.');
      }
    }

    const { data: created, error } = await auth.supabase
      .from('expenses')
      .insert({
        event_id: id,
        category_id: parsed.data.category_id || null,
        vendor_id: parsed.data.vendor_id || null,
        description: parsed.data.description,
        planned_amount: parsed.data.planned_amount ?? 0,
        actual_amount: parsed.data.actual_amount,
        expense_date: parsed.data.expense_date || new Date().toISOString().split('T')[0],
        notes: parsed.data.notes || null,
      })
      .select('*')
      .single();

    if (error || !created) {
      return serverError('Failed to create expense.', error?.message);
    }

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating expense.', message);
  }
}

