import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import OnboardingClient from "./OnboardingClient";

/**
 * Onboarding Server Component
 *
 * Server-side auth gate that protects the onboarding flow.
 * - Checks if user is authenticated via session cookies
 * - Redirects to /login if not authenticated
 * - Passes user data to client component if authenticated
 */
export default async function OnboardingPage() {
  console.log('🔍 [ONBOARDING] Checking authentication...');
  
  // Get SSR Supabase client (reads session from cookies)
  const supabase = await createServerClient();

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If no user or auth error, redirect to login
  if (error || !user) {
    console.log('❌ [ONBOARDING] Not authenticated, redirecting to login:', error?.message);
    redirect("/login");
  }

  console.log('✅ [ONBOARDING] User authenticated successfully:', {
    userId: user.id,
    email: user.email,
    emailConfirmed: user.email_confirmed_at,
  });
  
  // User is authenticated - render onboarding flow
  // Pass user data to client component
  return <OnboardingClient user={user} />;
}
