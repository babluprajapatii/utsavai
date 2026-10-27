import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { createVendorSchema, paginationQuerySchema } from '@/lib/api/validation';

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
    const parsedPagination = paginationQuerySchema.safeParse({
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    const { limit, offset } = parsedPagination.success
      ? parsedPagination.data
      : { limit: 50, offset: 0 };

    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = auth.supabase
      .from('vendors')
      .select('*', { count: 'exact' })
      .eq('event_id', id);

    if (category) {
      query = query.eq('category', category as any);
    }
    if (status) {
      query = query.eq('status', status as any);
    }

    const { data: vendors, error, count } = await query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return serverError('Failed to list vendors.', error.message);
    }

    const total = count ?? (vendors ? vendors.length : 0);
    const hasMore = offset + (vendors ? vendors.length : 0) < total;

    return apiSuccess(vendors ?? [], 200, {
      total,
      limit,
      offset,
      hasMore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while listing vendors.', message);
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

    const parsed = createVendorSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Vendor validation failed.', parsed.error.format());
    }

    const { data: created, error } = await auth.supabase
      .from('vendors')
      .insert({
        event_id: id,
        name: parsed.data.name,
        category: parsed.data.category,
        contact_name: parsed.data.contact_name || null,
        contact_phone: parsed.data.contact_phone || null,
        contact_email: parsed.data.contact_email || null,
        website: parsed.data.website || null,
        quoted_price: parsed.data.quoted_price ?? 0,
        agreed_price: parsed.data.agreed_price ?? 0,
        status: parsed.data.status || 'Researching',
        booking_date: parsed.data.booking_date || null,
        notes: parsed.data.notes || null,
      })
      .select('*')
      .single();

    if (error || !created) {
      return serverError('Failed to create vendor.', error?.message);
    }

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error while creating vendor.', message);
  }
}

