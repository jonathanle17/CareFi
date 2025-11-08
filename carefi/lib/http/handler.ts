/**
 * API Route Handler Builder
 *
 * Provides a consistent wrapper for Next.js API routes with:
 * - Method enforcement (GET, POST, PUT, DELETE, etc.)
 * - Automatic JSON body parsing with size limits
 * - Zod schema validation
 * - Centralized error handling
 * - Request ID generation for tracing
 *
 * This reduces boilerplate and ensures all routes follow the same patterns.
 *
 * @example
 * ```ts
 * export const POST = createHandler({
 *   methods: ['POST'],
 *   schema: signupSchema,
 *   handler: async (req, body) => {
 *     // body is typed and validated
 *     const user = await createUser(body);
 *     return created(user);
 *   },
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { HttpError, isHttpError } from './errors';
import { fail, internalServerError } from './response';
import { formatZodError } from '@/lib/validation/auth';

/**
 * Maximum request body size (1MB)
 * Prevents large payloads from overwhelming the server
 */
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

/**
 * HTTP methods supported by the handler
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Handler function type
 * Receives the request and validated body (if schema provided)
 */
type HandlerFunction<TBody = unknown> = (
  req: NextRequest,
  body: TBody
) => Promise<NextResponse> | NextResponse;

/**
 * Configuration for creating a route handler
 */
interface HandlerConfig<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  /**
   * Allowed HTTP methods for this route
   * If request uses a different method, returns 405 Method Not Allowed
   */
  methods: HttpMethod[];

  /**
   * Optional Zod schema to validate request body
   * If provided, body is parsed and validated before calling handler
   */
  schema?: TSchema;

  /**
   * The route handler function
   * Receives validated body if schema is provided
   */
  handler: HandlerFunction<TSchema extends z.ZodTypeAny ? z.infer<TSchema> : never>;
}

/**
 * Generate a unique request ID for tracing
 * Can be used in logs to correlate requests
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Parse and validate request body against a Zod schema
 *
 * @throws {HttpError} If body is too large, invalid JSON, or fails validation
 */
async function parseAndValidateBody<TSchema extends z.ZodTypeAny>(
  req: NextRequest,
  schema?: TSchema
): Promise<z.infer<TSchema> | undefined> {
  // If no schema, don't parse body
  if (!schema) {
    return undefined;
  }

  // Check Content-Type
  const contentType = req.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new HttpError(
      400,
      'bad_request/invalid_content_type',
      'Content-Type must be application/json'
    );
  }

  // Parse JSON with size limit
  let body: unknown;
  try {
    const text = await req.text();

    // Check size
    if (text.length > MAX_BODY_SIZE) {
      throw new HttpError(
        413,
        'bad_request/payload_too_large',
        `Request body exceeds ${MAX_BODY_SIZE} bytes`
      );
    }

    body = JSON.parse(text);
  } catch (error) {
    if (isHttpError(error)) {
      throw error;
    }
    throw new HttpError(
      400,
      'bad_request/invalid_json',
      'Request body must be valid JSON'
    );
  }

  // Validate with Zod schema
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = formatZodError(result.error);
    throw new HttpError(
      400,
      'bad_request/invalid_input',
      'Invalid input',
      errors
    );
  }

  return result.data;
}

/**
 * Create a Next.js API route handler with standardized error handling
 *
 * This wrapper provides:
 * - Method enforcement
 * - Automatic JSON parsing and validation
 * - Consistent error responses
 * - Request ID generation
 *
 * @param {HandlerConfig} config - Handler configuration
 * @returns {Function} Next.js route handler
 *
 * @example
 * ```ts
 * // app/api/signup/route.ts
 * export const POST = createHandler({
 *   methods: ['POST'],
 *   schema: signupSchema,
 *   handler: async (req, body) => {
 *     const user = await createUser(body);
 *     return created({ id: user.id, email: user.email });
 *   },
 * });
 * ```
 */
export function createHandler<TSchema extends z.ZodTypeAny>(
  config: HandlerConfig<TSchema>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      // Check if method is allowed
      if (!config.methods.includes(req.method as HttpMethod)) {
        return fail(
          405,
          'method_not_allowed',
          `Method ${req.method} not allowed. Allowed methods: ${config.methods.join(', ')}`
        );
      }

      // Parse and validate body if schema provided
      const body = await parseAndValidateBody(req, config.schema);

      // Call the handler
      const response = await config.handler(req, body as any);

      // Add request ID to response headers for tracing
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (error) {
      // Log error (in production, use a proper logger like pino)
      console.error(`[${requestId}] Error:`, error);

      // Handle HttpError instances
      if (isHttpError(error)) {
        const response = fail(
          error.statusCode,
          error.code,
          error.message,
          error.details
        );
        response.headers.set('X-Request-ID', requestId);
        return response;
      }

      // Handle unexpected errors
      const response = internalServerError(
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : (error as Error).message
      );
      response.headers.set('X-Request-ID', requestId);
      return response;
    }
  };
}

/**
 * Helper to create a simple GET handler without body validation
 *
 * @example
 * ```ts
 * export const GET = createGetHandler(async (req) => {
 *   const data = await fetchData();
 *   return ok(data);
 * });
 * ```
 */
export function createGetHandler(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return createHandler({
    methods: ['GET'],
    handler,
  });
}

/**
 * Helper to create a simple POST handler with body validation
 *
 * @example
 * ```ts
 * export const POST = createPostHandler(signupSchema, async (req, body) => {
 *   const user = await createUser(body);
 *   return created(user);
 * });
 * ```
 */
export function createPostHandler<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  handler: HandlerFunction<z.infer<TSchema>>
) {
  return createHandler({
    methods: ['POST'],
    schema,
    handler,
  });
}
