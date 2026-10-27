import { NextRequest } from 'next/server';
import { getAuthContext, verifyTaskOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  conflict,
  serverError,
} from '@/lib/api/response';
import { createDependencySchema } from '@/lib/api/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { taskId } = await params;
    const task = await verifyTaskOwnership(auth.supabase, taskId, auth.user.id);
    if (!task) {
      return notFound('Task not found.');
    }

    const { data: deps, error } = await auth.supabase
      .from('task_dependencies')
      .select('*, tasks!task_dependencies_depends_on_task_id_fkey(title)')
      .eq('task_id', taskId);

    if (error) {
      return serverError('Failed to list task dependencies.', error.message);
    }

    const formatted = (deps ?? []).map((d) => ({
      id: d.id,
      task_id: d.task_id,
      depends_on_task_id: d.depends_on_task_id,
      depends_on_task_title: (d.tasks as unknown as { title: string } | null)?.title ?? 'Unknown Task',
      created_at: d.created_at,
    }));

    return apiSuccess(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing task dependencies.', message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { taskId } = await params;
    const task = await verifyTaskOwnership(auth.supabase, taskId, auth.user.id);
    if (!task) {
      return notFound('Task not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = createDependencySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Dependency validation failed.', parsed.error.format());
    }

    const dependsOnId = parsed.data.depends_on_task_id;

    if (dependsOnId === taskId) {
      return badRequest('A task cannot depend on itself.');
    }

    // Verify prerequisite task exists and belongs to the same event
    const prereq = await verifyTaskOwnership(auth.supabase, dependsOnId, auth.user.id);
    if (!prereq) {
      return badRequest('Prerequisite task not found.');
    }

    if (prereq.event_id !== task.event_id) {
      return badRequest('Dependencies can only be created between tasks in the same event.');
    }

    // Check for reverse dependency (direct circular check)
    const { data: reverseDep } = await auth.supabase
      .from('task_dependencies')
      .select('id')
      .eq('task_id', dependsOnId)
      .eq('depends_on_task_id', taskId)
      .maybeSingle();

    if (reverseDep) {
      return conflict('Circular dependency detected between these tasks.');
    }

    const { data: created, error } = await auth.supabase
      .from('task_dependencies')
      .insert({
        task_id: taskId,
        depends_on_task_id: dependsOnId,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return conflict('Dependency already exists.');
      }
      return serverError('Failed to create dependency.', error.message);
    }

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating dependency.', message);
  }
}

