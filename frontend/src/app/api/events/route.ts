import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/api/auth';
import { apiSuccess, unauthorized, badRequest, serverError } from '@/lib/api/response';
import { createEventSchema, paginationQuerySchema } from '@/lib/api/validation';

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

    // Query events with exact user_id match (also enforced by RLS)
    const { data: events, error, count } = await auth.supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.user.id)
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[events API] Error fetching events:', error);
      return serverError('Failed to fetch events from database.', error.message);
    }

    const total = count ?? (events ? events.length : 0);
    const hasMore = offset + (events ? events.length : 0) < total;

    return apiSuccess(events ?? [], 200, {
      total,
      limit,
      offset,
      hasMore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[events API] Unexpected error:', err);
    return serverError('Unexpected server error while listing events.', message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Event validation failed.', parsed.error.format());
    }

    const { data: newEvent, error } = await auth.supabase
      .from('events')
      .insert({
        user_id: auth.user.id,
        name: parsed.data.name,
        type: parsed.data.type,
        event_date: parsed.data.event_date,
        start_time: parsed.data.start_time || null,
        end_time: parsed.data.end_time || null,
        location: parsed.data.location || null,
        description: parsed.data.description || null,
        guest_count: parsed.data.guest_count ?? 0,
        total_budget: parsed.data.total_budget ?? 0,
        currency: parsed.data.currency || 'INR',
        status: 'Planning',
      })
      .select('*')
      .single();

    if (error || !newEvent) {
      return serverError('Failed to create event in database.', error?.message);
    }

    return apiSuccess(newEvent, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating event.', message);
  }
}

