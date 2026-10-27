import { NextRequest } from 'next/server';
import { getAuthContext, verifyScheduleOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  apiNoContent,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateScheduleItemSchema } from '@/lib/api/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { scheduleId } = await params;
    const scheduleItem = await verifyScheduleOwnership(auth.supabase, scheduleId, auth.user.id);
    if (!scheduleItem) {
      return notFound('Schedule item not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateScheduleItemSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Schedule item update validation failed.', parsed.error.format());
    }

    const { data: updated, error } = await auth.supabase
      .from('event_schedule_items')
      .update(parsed.data)
      .eq('id', scheduleId)
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to update schedule item.', error?.message);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating schedule item.', message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { scheduleId } = await params;
    const scheduleItem = await verifyScheduleOwnership(auth.supabase, scheduleId, auth.user.id);
    if (!scheduleItem) {
      return notFound('Schedule item not found.');
    }

    const { error } = await auth.supabase
      .from('event_schedule_items')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      return serverError('Failed to delete schedule item.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting schedule item.', message);
  }
}

