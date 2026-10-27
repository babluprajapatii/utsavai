import { NextRequest } from 'next/server';
import { getAuthContext, verifyVendorOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  apiNoContent,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { updateVendorSchema } from '@/lib/api/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { vendorId } = await params;
    const vendor = await verifyVendorOwnership(auth.supabase, vendorId, auth.user.id);
    if (!vendor) {
      return notFound('Vendor not found.');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = updateVendorSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Vendor update validation failed.', parsed.error.format());
    }

    const { data: updated, error } = await auth.supabase
      .from('vendors')
      .update(parsed.data)
      .eq('id', vendorId)
      .select('*')
      .single();

    if (error || !updated) {
      return serverError('Failed to update vendor.', error?.message);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while updating vendor.', message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    const { vendorId } = await params;
    const vendor = await verifyVendorOwnership(auth.supabase, vendorId, auth.user.id);
    if (!vendor) {
      return notFound('Vendor not found.');
    }

    const { error } = await auth.supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId);

    if (error) {
      return serverError('Failed to delete vendor.', error.message);
    }

    return apiNoContent();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while deleting vendor.', message);
  }
}

