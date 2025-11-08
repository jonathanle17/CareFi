/**
 * Standardized HTTP Response Envelopes
 *
 * Provides consistent JSON response structure across all API endpoints.
 * All responses follow the envelope pattern for predictable client handling.
 *
 * Response Envelope Structure:
 * {
 *   success: boolean,     // Indicates if the request was successful
 *   data?: T,            // Present on success (2xx responses)
 *   error?: {            // Present on error (4xx, 5xx responses)
 *     code: string,      // Machine-readable error code
 *     message: string,   // Human-readable error message
 *     details?: unknown  // Optional additional error context
 *   }
 * }
 */

import { NextResponse } from 'next/server';

/**
 * Success response envelope (data present)
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * Error response envelope (error present)
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Create a 200 OK success response
 *
 * @param {T} data - Response payload
 * @returns {NextResponse} JSON response with 200 status
 *
 * @example
 * ```ts
 * return ok({ user: { id: '123', email: 'user@example.com' } });
 * // { success: true, data: { user: { ... } } }
 * ```
 */
export function ok<T>(data: T): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 200 }
  );
}

/**
 * Create a 201 Created success response
 *
 * @param {T} data - Created resource payload
 * @returns {NextResponse} JSON response with 201 status
 *
 * @example
 * ```ts
 * return created({ id: '123', email: 'user@example.com' });
 * // { success: true, data: { id: '123', ... } }
 * ```
 */
export function created<T>(data: T): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 }
  );
}

/**
 * Create an error response
 *
 * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 500, etc.)
 * @param {string} code - Machine-readable error code (e.g., "conflict/email_in_use")
 * @param {string} message - Human-readable error message
 * @param {unknown} details - Optional additional error context (e.g., validation errors)
 * @returns {NextResponse} JSON error response
 *
 * @example
 * ```ts
 * return fail(409, 'conflict/email_in_use', 'Email already registered');
 * // { success: false, error: { code: '...', message: '...' } }
 * ```
 */
export function fail(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
      },
    },
    { status: statusCode }
  );
}

/**
 * Convenience helpers for common error responses
 */

export function badRequest(message: string, details?: unknown) {
  return fail(400, 'bad_request/invalid_input', message, details);
}

export function unauthorized(message = 'Unauthorized', code = 'unauthorized/missing_credentials') {
  return fail(401, code, message);
}

export function forbidden(message = 'Forbidden', code = 'forbidden/insufficient_permissions') {
  return fail(403, code, message);
}

export function notFound(message = 'Not found', code = 'not_found/resource_not_found') {
  return fail(404, code, message);
}

export function conflict(message: string, code = 'conflict/resource_conflict') {
  return fail(409, code, message);
}

export function internalServerError(
  message = 'Internal server error',
  code = 'internal/server_error'
) {
  return fail(500, code, message);
}
