import { NextRequest } from 'next/server';
import { getAuthContext, verifyExpenseOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  apiNoContent,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateExpenseSchema } from '@/lib/api/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { expenseId } = await params;
    const expense = await verifyExpenseOwnership(auth.supabase, expenseId, auth.user.id);
    if (!expense) {
      return notFound('Expense not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Expense update validation failed.', parsed.error.format());
    }

    const { data: updated, error } = await auth.supabase
      .from('expenses')
      .update(parsed.data)
      .eq('id', expenseId)
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to update expense.', error?.message);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating expense.', message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { expenseId } = await params;
    const expense = await verifyExpenseOwnership(auth.supabase, expenseId, auth.user.id);
    if (!expense) {
      return notFound('Expense not found.');
    }

    const { error } = await auth.supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      return serverError('Failed to delete expense.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting expense.', message);
  }
}

