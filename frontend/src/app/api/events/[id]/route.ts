import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  apiNoContent,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateEventSchema } from '@/lib/api/validation';

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

    return apiSuccess(event);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while retrieving event.', message);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { id } = await params;
    const existing = await verifyEventOwnership(auth.supabase, id, auth.user.id);
    if (!existing) {
      return notFound('Event not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Event update validation failed.', parsed.error.format());
    }

    const { data: updatedEvent, error } = await auth.supabase
      .from('events')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .select('*')
      .single();

    if (error || !updatedEvent) {
      return serverError('Failed to update event.', error?.message);
    }

    return apiSuccess(updatedEvent);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating event.', message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { id } = await params;
    const existing = await verifyEventOwnership(auth.supabase, id, auth.user.id);
    if (!existing) {
      return notFound('Event not found.');
    }

    const { error } = await auth.supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.user.id);

    if (error) {
      return serverError('Failed to delete event.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting event.', message);
  }
}

