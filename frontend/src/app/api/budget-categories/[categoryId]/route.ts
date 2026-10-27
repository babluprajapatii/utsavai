import { NextRequest } from 'next/server';
import { getAuthContext, verifyCategoryOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  apiNoContent,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateBudgetCategorySchema } from '@/lib/api/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { categoryId } = await params;
    const category = await verifyCategoryOwnership(auth.supabase, categoryId, auth.user.id);
    if (!category) {
      return notFound('Budget category not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateBudgetCategorySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Validation failed.', parsed.error.format());
    }

    const { data: updated, error } = await auth.supabase
      .from('budget_categories')
      .update(parsed.data)
      .eq('id', categoryId)
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to update budget category.', error?.message);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating budget category.', message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { categoryId } = await params;
    const category = await verifyCategoryOwnership(auth.supabase, categoryId, auth.user.id);
    if (!category) {
      return notFound('Budget category not found.');
    }

    const { error } = await auth.supabase
      .from('budget_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      return serverError('Failed to delete budget category.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting budget category.', message);
  }
}

