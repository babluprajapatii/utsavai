import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { aiChatSchema } from '@/lib/api/validation';

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

    const parsed = aiChatSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Chat message validation failed.', parsed.error.format());
    }

    const { event_id, message } = parsed.data;

    // Verify event ownership
    const event = await verifyEventOwnership(auth.supabase, event_id, auth.user.id);
    if (!event) {
      return notFound('Event not found.');
    }

    // Locate or create conversation for this event
    let convId: string;
    const { data: existingConv } = await auth.supabase
      .from('ai_conversations')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', auth.user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingConv) {
      convId = existingConv.id;
    } else {
      const { data: newConv, error: convErr } = await auth.supabase
        .from('ai_conversations')
        .insert({
          event_id,
          user_id: auth.user.id,
          title: `${event.name} Planning Assistant`,
        })
        .select('id')
        .single();

      if (convErr || !newConv) {
        return serverError('Failed to initialize conversation session.', convErr?.message);
      }
      convId = newConv.id;
    }

    // Persist user prompt in ai_messages
    await auth.supabase.from('ai_messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
    });

    // Compute basic event context
    const today = new Date();
    const eventDate = new Date(event.event_date);
    const daysRemaining = Math.max(
      0,
      Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Contextual planning response foundation
    const assistantReply =
      `Based on your ${event.type} "${event.name}" scheduled for ${event.event_date} ` +
      `(${daysRemaining} days remaining, target budget ₹${Number(event.total_budget).toLocaleString('en-IN')}), ` +
      `here is my recommendation: ${message.includes('budget') ? 'Focus on vendor contracts that have high allocation to lock in fixed rates.' : 'Ensure prerequisite checklist tasks are assigned and scheduled.'}`;

    // Persist assistant message in ai_messages
    await auth.supabase.from('ai_messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: assistantReply,
    });

    return apiSuccess({
      response: assistantReply,
      conversationId: convId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error in AI chat endpoint.', message);
  }
}

