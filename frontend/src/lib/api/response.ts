import { NextResponse } from 'next/server';

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(
  data: T,
  status = 200,
  pagination?: PaginationMeta
): NextResponse<ApiSuccessEnvelope<T>> {
  const body: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
  };
  return NextResponse.json(body, { status });
}

export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorEnvelope> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status }
  );
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  AI_PROVIDER_UNAVAILABLE: 'AI_PROVIDER_UNAVAILABLE',
  AI_TIMEOUT: 'AI_TIMEOUT',
  AI_RATE_LIMITED: 'AI_RATE_LIMITED',
  AI_SCHEMA_INVALID: 'AI_SCHEMA_INVALID',
  AI_BUSINESS_INVALID: 'AI_BUSINESS_INVALID',
  AI_EMPTY_RESPONSE: 'AI_EMPTY_RESPONSE',
  AI_TEMPORARY_FAILURE: 'AI_TEMPORARY_FAILURE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export function unauthorized(message = 'Authentication required.') {
  return apiError(ErrorCodes.AUTHENTICATION_REQUIRED, message, 401);
}

export function forbidden(message = 'Access forbidden.') {
  return apiError(ErrorCodes.FORBIDDEN, message, 403);
}

export function notFound(message = 'Resource not found.') {
  return apiError(ErrorCodes.NOT_FOUND, message, 404);
}

export function badRequest(message = 'Validation failed.', details?: unknown) {
  return apiError(ErrorCodes.VALIDATION_ERROR, message, 400, details);
}

export function conflict(message = 'Resource conflict.') {
  return apiError(ErrorCodes.CONFLICT, message, 409);
}

export function serverError(message = 'An unexpected server error occurred.', details?: unknown) {
  return apiError(ErrorCodes.INTERNAL_ERROR, message, 500, details);
}

