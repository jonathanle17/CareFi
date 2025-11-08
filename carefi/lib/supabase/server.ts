/**
 * Supabase Admin Client (Server-side only)
 *
 * This module provides a cached Supabase client with service role privileges.
 * The service role key bypasses Row Level Security (RLS) and has full access.
 *
 * SECURITY WARNING:
 * - NEVER expose this client or the service role key to the client side
 * - Only use in API routes and server components
 * - Service role can read/write any data, bypassing all RLS policies
 *
 * Use cases:
 * - Creating auth users via admin API
 * - Inserting data into tables that users shouldn't directly access
 * - Performing privileged operations (e.g., deleting users, updating roles)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Cached Supabase admin client instance
 * Singleton pattern to avoid creating multiple clients
 */
let supabaseAdmin: SupabaseClient | null = null;

/**
 * Get or create the Supabase admin client
 *
 * This client uses the service role key and has full database access.
 * The instance is cached to avoid recreating the client on every call.
 *
 * @returns {SupabaseClient} Supabase client with admin privileges
 *
 * @example
 * ```ts
 * import { getSupabaseAdmin } from '@/lib/supabase/server';
 *
 * const admin = getSupabaseAdmin();
 * const { data, error } = await admin.auth.admin.createUser({
 *   email: 'user@example.com',
 *   password: 'securepassword',
 *   email_confirm: true,
 * });
 * ```
 */
export function getSupabaseAdmin(): SupabaseClient {
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
 * Type-safe database schema helper
 *
 * Use this when you need explicit type checking for database operations
 *
 * @example
 * ```ts
 * import { getSupabaseAdmin } from '@/lib/supabase/server';
 *
 * const admin = getSupabaseAdmin();
 * const { data, error } = await admin
 *   .from('user_profiles')
 *   .insert({
 *     id: userId,
 *     email: 'user@example.com',
 *     display_name: 'John Doe',
 *   });
 * ```
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
          password: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          display_name?: string | null;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          email?: string | null;
          password?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          display_name?: string | null;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          email?: string | null;
          password?: string | null;
        };
      };
    };
  };
};
