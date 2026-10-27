import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { createGuestSchema, paginationQuerySchema } from '@/lib/api/validation';

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

    const rsvp = searchParams.get('rsvp');
    const groupName = searchParams.get('group_name');

    let query = auth.supabase
      .from('guests')
      .select('*', { count: 'exact' })
      .eq('event_id', id);

    if (rsvp) {
      query = query.eq('rsvp_status', rsvp as any);
    }
    if (groupName) {
      query = query.eq('group_name', groupName);
    }

    const { data: guests, error, count } = await query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return serverError('Failed to list guests.', error.message);
    }

    const total = count ?? (guests ? guests.length : 0);
    const hasMore = offset + (guests ? guests.length : 0) < total;

    return apiSuccess(guests ?? [], 200, {
      total,
      limit,
      offset,
      hasMore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing guests.', message);
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

    const parsed = createGuestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Guest validation failed.', parsed.error.format());
    }

    const { data: created, error } = await auth.supabase
      .from('guests')
      .insert({
        event_id: id,
        name: parsed.data.name,
        group_name: parsed.data.group_name || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        rsvp_status: parsed.data.rsvp_status || 'Pending',
        plus_one: parsed.data.plus_one ?? false,
        meal_preference: parsed.data.meal_preference || null,
        special_requirements: parsed.data.special_requirements || null,
        notes: parsed.data.notes || null,
      })
      .select('*')
      .single();

    if (error || !created) {
      return serverError('Failed to create guest.', error?.message);
    }

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating guest.', message);
  }
}

