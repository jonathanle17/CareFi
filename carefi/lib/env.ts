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
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * Validates and returns server-side environment variables
 * Throws descriptive error if any required variable is missing
 */
function getServerEnv(): ServerEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];

  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!supabaseServiceRoleKey) missing.push('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl as string,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey as string,
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey as string,
  }
}

/**
 * Server-only environment variables
 *
 * Usage:
 * ```ts
 * import { env } from '@/lib/env';
 *
 * const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
 * ```
 */
export const env = getServerEnv();
