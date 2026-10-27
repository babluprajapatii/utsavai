import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  serverError,
} from '@/lib/api/response';
import { paginationQuerySchema } from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const parsedPagination = paginationQuerySchema.safeParse({
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    const { limit, offset } = parsedPagination.success
      ? parsedPagination.data
      : { limit: 50, offset: 0 };

    const unreadOnly = searchParams.get('unread_only') === 'true';

    let query = auth.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.user.id);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return serverError('Failed to list notifications.', error.message);
    }

    const total = count ?? (notifications ? notifications.length : 0);
    const hasMore = offset + (notifications ? notifications.length : 0) < total;

    // Map `is_read` to also supply `read` for frontend convenience
    const formatted = (notifications ?? []).map((n) => ({
      ...n,
      read: n.is_read,
    }));

    return apiSuccess(formatted, 200, {
      total,
      limit,
      offset,
      hasMore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing notifications.', message);
  }
}

