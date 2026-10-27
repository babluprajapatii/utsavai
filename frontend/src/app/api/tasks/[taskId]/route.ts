import { NextRequest } from 'next/server';
import { getAuthContext, verifyTaskOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  apiNoContent,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateTaskSchema } from '@/lib/api/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { taskId } = await params;
    const task = await verifyTaskOwnership(auth.supabase, taskId, auth.user.id);
    if (!task) {
      return notFound('Task not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Task update validation failed.', parsed.error.format());
    }

    const { data: updated, error } = await auth.supabase
      .from('tasks')
      .update(parsed.data)
      .eq('id', taskId)
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to update task.', error?.message);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating task.', message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { taskId } = await params;
    const task = await verifyTaskOwnership(auth.supabase, taskId, auth.user.id);
    if (!task) {
      return notFound('Task not found.');
    }

    const { error } = await auth.supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return serverError('Failed to delete task.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting task.', message);
  }
}

