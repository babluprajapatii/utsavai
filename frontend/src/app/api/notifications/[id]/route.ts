import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateNotificationSchema } from '@/lib/api/validation';

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

    // Verify notification belongs to the authenticated user
    const { data: existing, error: fetchError } = await auth.supabase
      .from('notifications')
      .select('id')
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .single();

    if (fetchError || !existing) {
      return notFound('Notification not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateNotificationSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Validation failed.', parsed.error.format());
    }

    const isRead = parsed.data.is_read ?? parsed.data.read ?? true;

    const { data: updated, error } = await auth.supabase
      .from('notifications')
      .update({ is_read: isRead })
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to update notification.', error?.message);
    }

    return apiSuccess({
      ...updated,
      read: updated.is_read,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating notification.', message);
  }
}

