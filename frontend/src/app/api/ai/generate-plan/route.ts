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
import { generatePlanSchema } from '@/lib/api/validation';
import {
  isGeminiConfigured,
  callGeminiApi,
  AiProviderError,
} from '@/lib/ai/client';
import { buildEventPlanningContext } from '@/lib/ai/context-builder';
import { buildPlanGenerationPrompt } from '@/lib/ai/prompt-builder';
import {
  validateAndNormalizePlan,
  generateDeterministicPlan,
  type GeneratedPlan,
} from '@/lib/ai/validation';

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

    const parsed = generatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Generate plan validation failed.', parsed.error.format());
    }

    const { event_id } = parsed.data;

    // 3. Verify event ownership (404 prevents IDOR leak)
    const event = await verifyEventOwnership(auth.supabase, event_id, auth.user.id);
    if (!event) {
      return notFound('Event not found.');
    }

    // 4. Assemble live event context
    const context = await buildEventPlanningContext(auth.supabase, event_id, auth.user.id);
    if (!context) {
      return notFound('Unable to compile event context.');
    }

    let finalPlan: GeneratedPlan;
    let warnings: string[] = [];

    // 5. Generate plan: Use Gemini if configured, otherwise use contextual fallback
    if (isGeminiConfigured()) {
      try {
        const { systemPrompt, messages } = buildPlanGenerationPrompt(context);

        const geminiResult = await callGeminiApi({
          systemPrompt,
          messages,
          responseMimeType: 'application/json',
          temperature: 0.2,
        });

        // Strip any markdown code fences if present
        let cleanText = geminiResult.text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        let rawPlanJson: unknown;
        try {
          rawPlanJson = JSON.parse(cleanText);
        } catch {
          return apiError(
            'AI_SCHEMA_INVALID',
            'Gemini generated an invalid JSON format for the plan.',
            422
          );
        }

        // Tier 1 & Tier 2 Validation
        const validation = validateAndNormalizePlan(rawPlanJson, context);
        if (!validation.valid || !validation.plan) {
          return apiError(
            'AI_BUSINESS_INVALID',
            'Generated plan failed planning sanity checks.',
            422,
            validation.errors
          );
        }

        finalPlan = validation.plan;
        warnings = validation.warnings || [];
      } catch (aiErr: unknown) {
        if (aiErr instanceof AiProviderError) {
          return apiError(aiErr.code, aiErr.message, aiErr.status);
        }
        // If unknown error during Gemini call, fallback safely
        console.error('Gemini plan generation error:', aiErr);
        finalPlan = generateDeterministicPlan(context);
        warnings.push('Plan generated using contextual planning heuristics.');
      }
    } else {
      // Offline / unconfigured development mode
      finalPlan = generateDeterministicPlan(context);
      warnings.push('Generated using contextual planning engine (Gemini API key unconfigured).');
    }

    // 6. Stage the draft plan in PostgreSQL `ai_generated_plans`
    const { data: stagedPlan, error: stageErr } = await auth.supabase
      .from('ai_generated_plans')
      .insert({
        user_id: auth.user.id,
        event_id: event.id,
        plan_data: finalPlan as any,
        status: 'Draft',
      })
      .select('id, created_at')
      .single();

    if (stageErr || !stagedPlan) {
      return serverError('Failed to stage generated plan in database.', stageErr?.message);
    }

    return apiSuccess({
      planId: stagedPlan.id,
      eventId: event.id,
      createdAt: stagedPlan.created_at,
      plan: finalPlan,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return serverError('An error occurred during event plan generation.', message);
  }
}
