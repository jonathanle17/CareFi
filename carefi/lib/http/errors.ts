/**
 * HTTP Error Classes and Utilities
 *
 * Provides typed HTTP errors with consistent error codes and status codes.
 * These errors are automatically caught and transformed into JSON responses
 * by the route handler (see lib/http/handler.ts).
 *
 * Error Code Convention:
 * - Format: "{category}/{specific_error}"
 * - Examples: "bad_request/invalid_input", "conflict/email_in_use"
 * - Stable codes allow clients to handle errors programmatically
 */

/**
 * Base HTTP Error class
 * All custom HTTP errors extend from this
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request
 * Use when client sends invalid data (validation errors, malformed requests)
 */
export class BadRequestError extends HttpError {
  constructor(message = 'Bad request', details?: unknown) {
    super(400, 'bad_request/invalid_input', message, details);
    this.name = 'BadRequestError';
  }
}

/**
 * 401 Unauthorized
 * Use when authentication is required but not provided or invalid
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', code = 'unauthorized/missing_credentials') {
    super(401, code, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden
 * Use when user is authenticated but lacks permission for the resource
 */
export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', code = 'forbidden/insufficient_permissions') {
    super(403, code, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found
 * Use when requested resource doesn't exist
 */
export class NotFoundError extends HttpError {
  constructor(message = 'Not found', code = 'not_found/resource_not_found') {
    super(404, code, message);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 Conflict
 * Use when request conflicts with current state (e.g., duplicate email)
 */
export class ConflictError extends HttpError {
  constructor(message = 'Conflict', code = 'conflict/resource_conflict') {
    super(409, code, message);
    this.name = 'ConflictError';
  }
}

/**
 * 500 Internal Server Error
 * Use for unexpected server errors
 */
export class InternalServerError extends HttpError {
  constructor(message = 'Internal server error', code = 'internal/server_error') {
    super(500, code, message);
    this.name = 'InternalServerError';
  }
}

/**
 * Helper to check if an error is an HttpError
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Common error codes for reference
 */
export const ErrorCodes = {
  // 400 Bad Request
  INVALID_INPUT: 'bad_request/invalid_input',
  MISSING_FIELDS: 'bad_request/missing_fields',
  INVALID_FORMAT: 'bad_request/invalid_format',

  // 401 Unauthorized
  MISSING_CREDENTIALS: 'unauthorized/missing_credentials',
  INVALID_CREDENTIALS: 'unauthorized/invalid_credentials',
  TOKEN_EXPIRED: 'unauthorized/token_expired',

  // 403 Forbidden
  INSUFFICIENT_PERMISSIONS: 'forbidden/insufficient_permissions',
  ACCOUNT_DISABLED: 'forbidden/account_disabled',

  // 404 Not Found
  RESOURCE_NOT_FOUND: 'not_found/resource_not_found',
  USER_NOT_FOUND: 'not_found/user_not_found',

  // 409 Conflict
  EMAIL_IN_USE: 'conflict/email_in_use',
  RESOURCE_CONFLICT: 'conflict/resource_conflict',

  // 500 Internal Server Error
  SERVER_ERROR: 'internal/server_error',
  DATABASE_ERROR: 'internal/database_error',
} as const;
