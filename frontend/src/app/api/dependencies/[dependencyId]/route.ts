import { NextRequest } from 'next/server';
import { getAuthContext, verifyTaskOwnership } from '@/lib/api/auth';
import {
  apiNoContent,
  unauthorized,
  notFound,
  serverError,
} from '@/lib/api/response';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dependencyId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { dependencyId } = await params;

    // Check dependency exists
    const { data: dep, error: fetchError } = await auth.supabase
      .from('task_dependencies')
      .select('id, task_id')
      .eq('id', dependencyId)
      .single();

    if (fetchError || !dep) {
      return notFound('Task dependency not found.');
    }

    // Verify ownership of the parent task
    const task = await verifyTaskOwnership(auth.supabase, dep.task_id, auth.user.id);
    if (!task) {
      return notFound('Task dependency not found.');
    }

    const { error } = await auth.supabase
      .from('task_dependencies')
      .delete()
      .eq('id', dependencyId);

    if (error) {
      return serverError('Failed to delete dependency.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting dependency.', message);
  }
}

