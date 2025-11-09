import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { SettingsClient } from './SettingsClient';

/**
 * Settings Page (Server Component)
 *
 * Server-side authentication and data fetching
 * - Checks user session
 * - Fetches user profile data
 * - Redirects if not authenticated
 */
export default async function SettingsPage() {
  // Get authenticated user
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to sign-in if not authenticated
  if (authError || !user) {
    redirect('/signin');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, email')
    .eq('id', user.id)
    .single();

  // Pass data to client component
  return (
    <SettingsClient
      userId={user.id}
      email={user.email || ''}
      displayName={profile?.display_name || null}
    />
  );
}

