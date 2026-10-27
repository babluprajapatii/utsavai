import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { createBudgetCategorySchema } from '@/lib/api/validation';

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

    const { data: categories, error } = await auth.supabase
      .from('budget_categories')
      .select('*')
      .eq('event_id', id)
      .order('name', { ascending: true });

    if (error) {
      return serverError('Failed to fetch budget categories.', error.message);
    }

    return apiSuccess(categories ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing budget categories.', message);
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

    const parsed = createBudgetCategorySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Validation failed.', parsed.error.format());
    }

    const { data: created, error } = await auth.supabase
      .from('budget_categories')
      .insert({
        event_id: id,
        name: parsed.data.name,
        planned_amount: parsed.data.planned_amount ?? 0,
      })
      .select('*')
      .single();

    if (error || !created) {
      return serverError('Failed to create budget category.', error?.message);
    }

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating budget category.', message);
  }
}

