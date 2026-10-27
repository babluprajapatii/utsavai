import { NextRequest } from 'next/server';
import { getAuthContext, verifyGuestOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  apiNoContent,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateGuestSchema } from '@/lib/api/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { guestId } = await params;
    const guest = await verifyGuestOwnership(auth.supabase, guestId, auth.user.id);
    if (!guest) {
      return notFound('Guest not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateGuestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Guest update validation failed.', parsed.error.format());
    }

    const { data: updated, error } = await auth.supabase
      .from('guests')
      .update(parsed.data)
      .eq('id', guestId)
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to update guest.', error?.message);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating guest.', message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { guestId } = await params;
    const guest = await verifyGuestOwnership(auth.supabase, guestId, auth.user.id);
    if (!guest) {
      return notFound('Guest not found.');
    }

    const { error } = await auth.supabase
      .from('guests')
      .delete()
      .eq('id', guestId);

    if (error) {
      return serverError('Failed to delete guest.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting guest.', message);
  }
}

