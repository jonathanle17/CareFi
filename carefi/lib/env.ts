/**
 * Type-safe environment variable loader
 *
 * This module validates required environment variables at runtime
 * and provides type-safe access throughout the application.
 *
 * IMPORTANT: Only use this on the server side (API routes, server components)
 * Never import this in client components as it will expose secrets.
 *
 * @throws {Error} If required environment variables are missing
 */

interface ServerEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * Validates and returns server-side environment variables
 * Throws descriptive error if any required variable is missing
 */
function getServerEnv(): ServerEnv {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];

  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  return {
    SUPABASE_URL: supabaseUrl as string,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey as string,
  }
}

/**
 * Server-only environment variables
 *
 * Usage:
 * ```ts
 * import { env } from '@/lib/env';
 *
 * const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
 * ```
 */
export const env = getServerEnv();
