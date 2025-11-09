/**
 * Supabase Server-Side Clients
 *
 * This module provides two types of Supabase clients for server-side use:
 *
 * 1. SSR Client (createServerClient):
 *    - Uses @supabase/ssr for cookie-based session management
 *    - Respects RLS policies based on authenticated user
 *    - Use for auth operations and user-scoped queries
 *
 * 2. Admin Client (createAdminClient):
 *    - Uses service role key (bypasses RLS)
 *    - Full database access
 *    - Use sparingly for privileged operations only
 *
 * SECURITY WARNING:
 * - NEVER expose service role key to client side
 * - Only use admin client when RLS bypass is truly needed
 * - Prefer SSR client for most server operations
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/**
 * Create a Supabase SSR client with cookie-based session management
 *
 * This client:
 * - Automatically reads/writes auth session cookies
 * - Respects Row Level Security (RLS) policies
 * - Provides access to authenticated user context
 * - Should be used for auth operations and user-scoped data
 *
 * @returns {Promise<SupabaseClient>} Supabase client with cookie session support
 *
 * @example
 * ```ts
 * // In a server component
 * import { createServerClient } from '@/lib/supabase/server';
 *
 * const supabase = await createServerClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 *
 * @example
 * ```ts
 * // In an API route
 * import { createServerClient } from '@/lib/supabase/server';
 *
 * const supabase = await createServerClient();
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password',
 * });
 * ```
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error('Error setting cookies:', error);
          }
        },
      },
    }
  );
}

/**
 * Cached Supabase admin client instance
 * Singleton pattern to avoid creating multiple clients
 */
let supabaseAdmin: SupabaseClient | null = null;

/**
 * Create or retrieve the Supabase admin client
 *
 * This client uses the service role key and bypasses RLS.
 * Only use when you need privileged access that normal users shouldn't have.
 *
 * Common use cases:
 * - Creating auth users via admin API
 * - Inserting data into protected tables
 * - Performing system-level operations
 *
 * @returns {SupabaseClient} Supabase client with admin privileges
 *
 * @example
 * ```ts
 * import { createAdminClient } from '@/lib/supabase/server';
 *
 * const admin = createAdminClient();
 * const { data, error } = await admin.auth.admin.createUser({
 *   email: 'user@example.com',
 *   password: 'securepassword',
 *   email_confirm: true,
 * });
 * ```
 */
export function createAdminClient(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return supabaseAdmin;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use createAdminClient() instead
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createAdminClient();
}

/**
 * Type-safe database schema helper
 *
 * Use this when you need explicit type checking for database operations
 */
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          display_name: string | null;
          onboarding_completed: boolean;
          onboarding_completed_at: string | null;
          email: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          display_name?: string | null;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          email?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          display_name?: string | null;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          email?: string | null;
        };
      };
    };
  };
};
