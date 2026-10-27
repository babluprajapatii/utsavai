import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  serverError,
} from '@/lib/api/response';

export async function POST(_request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { data, error } = await auth.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', auth.user.id)
      .eq('is_read', false)
      .select('id');

    if (error) {
      return serverError('Failed to mark notifications as read.', error.message);
    }

    return apiSuccess({
      updated: data ? data.length : 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while marking notifications as read.', message);
  }
}

