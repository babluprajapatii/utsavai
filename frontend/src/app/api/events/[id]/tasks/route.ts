import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { createTaskSchema, paginationQuerySchema } from '@/lib/api/validation';

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

    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const dueBefore = searchParams.get('due_before');

    let query = auth.supabase
      .from('tasks')
      .select('*, task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id)', { count: 'exact' })
      .eq('event_id', id);

    if (status) {
      query = query.eq('status', status as any);
    }
    if (priority) {
      query = query.eq('priority', priority as any);
    }
    if (dueBefore) {
      query = query.lte('due_date', dueBefore);
    }

    const { data: tasks, error, count } = await query
      .order('due_date', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return serverError('Failed to list tasks.', error.message);
    }

    const total = count ?? (tasks ? tasks.length : 0);
    const hasMore = offset + (tasks ? tasks.length : 0) < total;

    return apiSuccess(tasks ?? [], 200, {
      total,
      limit,
      offset,
      hasMore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing tasks.', message);
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

    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Task validation failed.', parsed.error.format());
    }

    const { data: created, error } = await auth.supabase
      .from('tasks')
      .insert({
        event_id: id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        category: parsed.data.category || null,
        priority: parsed.data.priority || 'Medium',
        status: parsed.data.status || 'Not Started',
        due_date: parsed.data.due_date || null,
        assigned_to: parsed.data.assigned_to || null,
        notes: parsed.data.notes || null,
      })
      .select('*')
      .single();

    if (error || !created) {
      return serverError('Failed to create task.', error?.message);
    }

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating task.', message);
  }
}

