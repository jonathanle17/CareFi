/**
 * Supabase Browser Client
 *
 * This module provides a Supabase client for client-side use in React components.
 * It uses the public anon key and respects RLS policies.
 *
 * USAGE:
 * - Import this in client components ("use client")
 * - Use for authenticated queries that respect RLS
 * - Session is automatically managed via cookies
 *
 * SECURITY:
 * - Only uses NEXT_PUBLIC_SUPABASE_ANON_KEY (safe for browser)
 * - All operations respect Row Level Security (RLS)
 * - Never exposes service role key
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './server';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Get or create the singleton Supabase browser client
 *
 * @returns {ReturnType<typeof createBrowserClient<Database>>} Supabase client for browser use
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { getSupabaseBrowserClient } from '@/lib/supabase/client';
 *
 * export function MyComponent() {
 *   const supabase = getSupabaseBrowserClient();
 *
 *   async function fetchData() {
 *     const { data, error } = await supabase
 *       .from('user_profiles')
 *       .select('*')
 *       .single();
 *
 *     if (error) console.error(error);
 *     return data;
 *   }
 *
 *   // ...
 * }
 * ```
 */
export function getSupabaseBrowserClient() {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. ' +
        'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
      );
    }

    client = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
    );
  }

  return client;
}
