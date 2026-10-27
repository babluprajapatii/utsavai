import { NextRequest } from 'next/server';
import { getAuthContext, verifyMilestoneOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  apiNoContent,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateMilestoneSchema } from '@/lib/api/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { milestoneId } = await params;
    const milestone = await verifyMilestoneOwnership(auth.supabase, milestoneId, auth.user.id);
    if (!milestone) {
      return notFound('Milestone not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Milestone update validation failed.', parsed.error.format());
    }

    const { data: updated, error } = await auth.supabase
      .from('event_milestones')
      .update(parsed.data)
      .eq('id', milestoneId)
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to update milestone.', error?.message);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating milestone.', message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { milestoneId } = await params;
    const milestone = await verifyMilestoneOwnership(auth.supabase, milestoneId, auth.user.id);
    if (!milestone) {
      return notFound('Milestone not found.');
    }

    const { error } = await auth.supabase
      .from('event_milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) {
      return serverError('Failed to delete milestone.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting milestone.', message);
  }
}

