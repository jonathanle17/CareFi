import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { DashboardClient } from './DashboardClient';
import type { OnboardingRow } from '@/lib/types';

/**
 * Dashboard Page (Server Component)
 *
 * Server-side authentication and data fetching
 * - Checks user session
 * - Fetches onboarding data
 * - Redirects if not authenticated or onboarding incomplete
 */
export default async function DashboardPage() {
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

  // Fetch user's onboarding data
  const { data: onboardingData, error: onboardingError } = await supabase
    .from('onboarding_data')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no onboarding data, redirect to onboarding
  if (onboardingError || !onboardingData) {
    redirect('/onboarding');
  }

  // Fetch user profile for display name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  // Pass data to client component
  return (
    <DashboardClient
      onboardingData={onboardingData as OnboardingRow}
      displayName={profile?.display_name || null}
    />
  );
}
