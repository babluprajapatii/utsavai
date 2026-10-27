import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { createMilestoneSchema } from '@/lib/api/validation';

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
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = auth.supabase
      .from('event_milestones')
      .select('*')
      .eq('event_id', id);

    if (date) {
      query = query.eq('milestone_date', date);
    }
    if (status) {
      query = query.eq('status', status as any);
    }

    const { data: milestones, error } = await query.order('milestone_date', {
      ascending: true,
    });

    if (error) {
      return serverError('Failed to list milestones.', error.message);
    }

    return apiSuccess(milestones ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing milestones.', message);
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

    const parsed = createMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Milestone validation failed.', parsed.error.format());
    }

    const { data: created, error } = await auth.supabase
      .from('event_milestones')
      .insert({
        event_id: id,
        title: parsed.data.title,
        milestone_date: parsed.data.milestone_date,
        description: parsed.data.description || null,
        status: parsed.data.status || 'Pending',
      })
      .select('*')
      .single();

    if (error || !created) {
      return serverError('Failed to create milestone.', error?.message);
    }

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating milestone.', message);
  }
}

