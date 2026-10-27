import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
  apiError,
} from '@/lib/api/response';
import { aiChatSchema } from '@/lib/api/validation';
import {
  isGeminiConfigured,
  callGeminiApi,
  AiProviderError,
} from '@/lib/ai/client';
import { buildChatConversationContext } from '@/lib/ai/context-builder';
import { buildChatPrompt } from '@/lib/ai/prompt-builder';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    // 2. Validate request body
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

    // 3. Verify event ownership (404 prevents IDOR leak)
    const event = await verifyEventOwnership(auth.supabase, event_id, auth.user.id);
    if (!event) {
      return notFound('Event not found.');
    }

    // 4. Locate or initialize conversation thread for this event
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

    // 5. Persist user message in PostgreSQL `ai_messages`
    await auth.supabase.from('ai_messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
    });

    // 6. Build query context and bounded 6-turn history
    const chatContext = await buildChatConversationContext(
      auth.supabase,
      event_id,
      auth.user.id,
      convId
    );

    if (!chatContext) {
      return notFound('Failed to retrieve event planning context.');
    }

    let assistantReply: string;
    let tokensUsed: number | undefined;

    // 7. Generate response using Gemini 1.5 Flash (or contextual fallback if unconfigured)
    if (isGeminiConfigured()) {
      try {
        const { systemPrompt, messages } = buildChatPrompt(
          chatContext.eventContext,
          chatContext.recentTurns,
          message
        );

        const geminiResult = await callGeminiApi({
          systemPrompt,
          messages,
          responseMimeType: 'text/plain',
          temperature: 0.3,
        });

        assistantReply = geminiResult.text.trim();
        tokensUsed = geminiResult.tokensUsed;
      } catch (aiErr: unknown) {
        if (aiErr instanceof AiProviderError) {
          return apiError(aiErr.code, aiErr.message, aiErr.status);
        }
        console.error('Gemini chat error:', aiErr);
        assistantReply = generateContextualAssistantFallback(
          message,
          chatContext.eventContext
        );
      }
    } else {
      // Offline / development fallback grounded in real event context
      assistantReply = generateContextualAssistantFallback(
        message,
        chatContext.eventContext
      );
    }

    // 8. Persist assistant message in PostgreSQL `ai_messages`
    await auth.supabase.from('ai_messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: assistantReply,
    });

    // Update conversation timestamp
    await auth.supabase
      .from('ai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convId);

    return apiSuccess({
      response: assistantReply,
      conversationId: convId,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return serverError('An error occurred while processing your message.', errorMsg);
  }
}

/**
 * Intelligent contextual fallback assistant grounded in real database context.
 * Used when Gemini API is unconfigured in development.
 */
function generateContextualAssistantFallback(
  userMessage: string,
  ctx: import('@/lib/ai/context-builder').EventContextSummary
): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('prioriti') || msg.includes('what should i do') || msg.includes('next')) {
    if (ctx.tasksSummary.overdue > 0) {
      return `For "${ctx.name}", you have ${ctx.tasksSummary.overdue} overdue task(s). With ${ctx.daysRemaining} days remaining, tackle those overdue items first to prevent timeline cascade delays. Then focus on confirming unbooked categories: ${ctx.vendorsSummary.unbookedCategories.slice(0, 2).join(' and ') || 'Venue & Catering'}.`;
    }
    return `For "${ctx.name}" (${ctx.daysRemaining} days away), here are your top 3 immediate priorities:\n\n1. Ensure core vendor bookings are locked: ${ctx.vendorsSummary.unbookedCategories.slice(0, 2).join(' and ') || 'Venue contracts'}.\n2. Monitor attendee RSVPs (currently ${ctx.guestsSummary.confirmed} confirmed of ${ctx.guestCount} planned).\n3. Keep budget spending within target (currently ₹${ctx.totalSpent.toLocaleString('en-IN')} spent of ₹${ctx.totalBudget.toLocaleString('en-IN')}).`;
  }

  if (msg.includes('budget') || msg.includes('reduce') || msg.includes('save') || msg.includes('cost')) {
    return `Looking at "${ctx.name}" with a budget of ₹${ctx.totalBudget.toLocaleString('en-IN')} (₹${ctx.totalSpent.toLocaleString('en-IN')} spent, ₹${ctx.remainingBudget.toLocaleString('en-IN')} remaining):\n\n- Revisit floral and stage decor; choosing seasonal local varieties can save 15-20%.\n- Finalize your guest headcount (${ctx.guestCount} expected) before locking caterer plate minimums.\n- Preserve your contingency line item until the final 14 days before the celebration.`;
  }

  if (msg.includes('overdue') || msg.includes('task') || msg.includes('forget')) {
    if (ctx.tasksSummary.overdue === 0) {
      return `Good news! There are zero overdue tasks for "${ctx.name}". You have completed ${ctx.tasksSummary.completed} out of ${ctx.tasksSummary.total} tasks. Focus on the upcoming milestones as the celebration date (${ctx.eventDate}) approaches.`;
    }
    return `You have ${ctx.tasksSummary.overdue} overdue tasks for "${ctx.name}". I recommend reviewing your task list and adjusting due dates realistically so your team remains aligned.`;
  }

  if (msg.includes('checklist') || msg.includes('7-day') || msg.includes('seven')) {
    return `Here is a focused final countdown checklist for "${ctx.name}":\n\n1. Confirm all vendor arrival and load-in timings in writing.\n2. Final headcount handover to caterer with dietary breakdown.\n3. Final seating chart, name cards, and stage arrangements verified.\n4. Emergency kit packed (first aid, safety pins, chargers, power banks).\n5. Rehearse ceremony sequence with family and coordinators.\n6. Confirm pickup and lodging arrangements for out-of-town guests.\n7. Rest well and enjoy the celebration!`;
  }

  return `I am tracking "${ctx.name}" scheduled for ${ctx.eventDate} (${ctx.daysRemaining} days to go, target budget ₹${ctx.totalBudget.toLocaleString('en-IN')}). You currently have ${ctx.tasksSummary.completed}/${ctx.tasksSummary.total} tasks completed and ₹${ctx.remainingBudget.toLocaleString('en-IN')} remaining. Ask me how to prioritize tasks, review budget allocations, or prepare your week-of checklist!`;
}
