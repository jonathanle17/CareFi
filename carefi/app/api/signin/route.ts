/**
 * POST /api/signin
 *
 * Authenticate an existing user with email and password, then establish a session.
 *
 * This endpoint:
 * 1. Validates the request body (email, password)
 * 2. Authenticates with Supabase Auth (verifies password against auth.users)
 * 3. Sets session cookies via @supabase/ssr
 * 4. Fetches user profile from user_profiles table
 * 5. Returns user and session data
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123"
 * }
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "displayName": "John Doe",
 *       "onboardingCompleted": false
 *     },
 *     "session": {
 *       "access_token": "...",
 *       "refresh_token": "...",
 *       "expires_at": 1234567890
 *     }
 *   }
 * }
 *
 * Error Responses:
 * - 400: Invalid input (validation errors)
 * - 401: Invalid credentials or email not confirmed
 * - 500: Server error
 *
 * Example cURL:
 * ```bash
 * curl -X POST http://localhost:3000/api/signin \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "user@example.com",
 *     "password": "SecurePass123"
 *   }'
 * ```
 *
 * Security:
 * - Never logs or returns plaintext passwords
 * - Session cookies are set via @supabase/ssr
 * - Enforces 1MB request size limit
 * - Password verification handled by Supabase Auth (bcrypt)
 */

import { createPostHandler } from '@/lib/http/handler';
import { ok } from '@/lib/http/response';
import { loginSchema } from '@/lib/validation/auth';
import { createServerClient } from '@/lib/supabase/server';
import { UnauthorizedError, InternalServerError } from '@/lib/http/errors';

/**
 * Force dynamic rendering for this route
 * Prevents Next.js from statically optimizing this API route
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/signin handler
 *
 * The createPostHandler wrapper provides:
 * - Method enforcement (only POST allowed)
 * - JSON body parsing with size limit (1MB)
 * - Zod schema validation
 * - Automatic error handling and response formatting
 * - Request ID generation for tracing
 */
export const POST = createPostHandler(loginSchema, async (req, body) => {
  const { email, password } = body;

  console.log('🔐 [SIGNIN] Starting signin process for:', email);

  // Step 1: Authenticate with Supabase Auth
  // This verifies the password against auth.users table
  // The SSR client will automatically set session cookies
  const supabase = await createServerClient();

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Handle authentication errors
  if (signInError) {
    console.log('❌ [SIGNIN] Authentication failed:', signInError.message);

    // Check if error is due to email not being confirmed
    if (
      signInError.message?.includes('Email not confirmed') ||
      signInError.message?.includes('confirm your email') ||
      signInError.message?.includes('email address is not confirmed')
    ) {
      console.log('📧 [SIGNIN] Email confirmation required');
      throw new UnauthorizedError(
        'Please check your email and confirm your account before signing in.',
        'unauthorized/email_not_confirmed'
      );
    }

    // Check if error is due to invalid credentials
    if (
      signInError.message?.includes('Invalid login credentials') ||
      signInError.message?.includes('Invalid email or password') ||
      signInError.message?.includes('Invalid credentials')
    ) {
      console.log('❌ [SIGNIN] Invalid credentials');
      throw new UnauthorizedError(
        'Invalid email or password. Please check your credentials and try again.',
        'unauthorized/invalid_credentials'
      );
    }

    // Other unexpected errors
    console.error('❌ [SIGNIN] Unexpected sign-in error:', signInError);
    throw new InternalServerError('An error occurred during sign-in. Please try again.');
  }

  if (!signInData.user || !signInData.session) {
    console.error('❌ [SIGNIN] Sign-in succeeded but no user or session returned');
    throw new InternalServerError('Sign-in succeeded but session could not be established.');
  }

  console.log('✅ [SIGNIN] Authentication successful!');
  console.log('📝 [SIGNIN] Session details:', {
    userId: signInData.user.id,
    email: signInData.user.email,
    access_token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
    expires_at: signInData.session.expires_at,
    expires_in: signInData.session.expires_in,
    token_type: signInData.session.token_type,
  });

  // Step 2: Fetch user profile from user_profiles table
  // The user_profiles table has a foreign key to auth.users(id)
  // Since we're authenticated, RLS will allow us to read our own profile
  console.log('👤 [SIGNIN] Fetching user profile...');
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('display_name, onboarding_completed, onboarding_completed_at, email')
    .eq('id', signInData.user.id)
    .single();

  if (profileError) {
    console.error('⚠️ [SIGNIN] Could not fetch user profile:', profileError);
    // Don't fail the sign-in if profile fetch fails - user is still authenticated
    // Just log the error and continue with auth user data
  }

  console.log('🍪 [SIGNIN] Session cookies should now be set by Supabase SSR client');

  // Step 3: Return user profile and session
  // Session cookies are automatically set by the SSR client
  const response = ok({
    user: {
      id: signInData.user.id,
      email: signInData.user.email || profile?.email || null,
      displayName: profile?.display_name || null,
      onboardingCompleted: profile?.onboarding_completed ?? false,
    },
    session: {
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      expires_at: signInData.session.expires_at,
    },
  });

  console.log('✨ [SIGNIN] Sign-in complete! Returning response with session data.');

  return response;
});

