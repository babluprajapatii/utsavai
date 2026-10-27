import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { createScheduleItemSchema } from '@/lib/api/validation';

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

    const { data: schedule, error } = await auth.supabase
      .from('event_schedule_items')
      .select('*, vendors(name)', { count: 'exact' })
      .eq('event_id', id)
      .order('start_time', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      return serverError('Failed to list schedule items.', error.message);
    }

    return apiSuccess(schedule ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing schedule items.', message);
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

    const parsed = createScheduleItemSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Schedule item validation failed.', parsed.error.format());
    }

    const { data: created, error } = await auth.supabase
      .from('event_schedule_items')
      .insert({
        event_id: id,
        activity: parsed.data.activity,
        start_time: parsed.data.start_time,
        end_time: parsed.data.end_time || null,
        description: parsed.data.description || null,
        location: parsed.data.location || null,
        responsible_person: parsed.data.responsible_person || null,
        responsible_vendor_id: parsed.data.responsible_vendor_id || null,
        sort_order: parsed.data.sort_order ?? 0,
      })
      .select('*')
      .single();

    if (error || !created) {
      return serverError('Failed to create schedule item.', error?.message);
    }

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating schedule item.', message);
  }
}

