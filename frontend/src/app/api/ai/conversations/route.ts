import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = auth.supabase
      .from('ai_conversations')
      .select('*, ai_messages(*)')
      .eq('user_id', auth.user.id);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: convs, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      return serverError('Failed to list conversations.', error.message);
    }

    return apiSuccess(convs ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing conversations.', message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    let body: { event_id?: string; title?: string };
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    if (!body.event_id) {
      return badRequest('event_id is required.');
    }

    const event = await verifyEventOwnership(auth.supabase, body.event_id, auth.user.id);
    if (!event) {
      return notFound('Event not found.');
    }

    const { data: conv, error } = await auth.supabase
      .from('ai_conversations')
      .insert({
        user_id: auth.user.id,
        event_id: body.event_id,
        title: body.title || `${event.name} Planning Chat`,
      })
      .select('*')
      .single();

    if (error || !conv) {
      return serverError('Failed to create conversation.', error?.message);
    }

    return apiSuccess(conv, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating conversation.', message);
  }
}

