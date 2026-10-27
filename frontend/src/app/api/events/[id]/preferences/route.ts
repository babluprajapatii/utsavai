import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { eventPreferencesSchema } from '@/lib/api/validation';

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

    const { data: preferences, error } = await auth.supabase
      .from('event_preferences')
      .select('*')
      .eq('event_id', id)
      .maybeSingle();

    if (error) {
      return serverError('Failed to retrieve preferences.', error.message);
    }

    // If no preferences yet, return default empty shape
    return apiSuccess(
      preferences ?? {
        event_id: id,
        theme: null,
        style: null,
        priorities: [],
        special_requirements: null,
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while retrieving preferences.', message);
  }
}

export async function PUT(
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

    const parsed = eventPreferencesSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Preferences validation failed.', parsed.error.format());
    }

    // Upsert preference based on event_id unique constraint
    const { data: updated, error } = await auth.supabase
      .from('event_preferences')
      .upsert(
        {
          event_id: id,
          theme: parsed.data.theme ?? null,
          style: parsed.data.style ?? null,
          priorities: parsed.data.priorities ?? [],
          special_requirements: parsed.data.special_requirements ?? null,
        },
        { onConflict: 'event_id' }
      )
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to save preferences.', error?.message);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating preferences.', message);
  }
}

