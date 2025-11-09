/**
 * POST /api/signup
 *
 * Create a new user account with email and password, then automatically sign them in.
 *
 * This endpoint:
 * 1. Validates the request body (email, password, displayName)
 * 2. Creates a Supabase Auth user (auto-confirmed)
 * 3. Creates user profile in database (no password storage)
 * 4. Automatically signs the user in with password to establish session cookies
 * 5. Returns user and session data
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123",  // Min 8 chars, ≥1 letter, ≥1 number
 *   "displayName": "John Doe"     // Optional, max 80 chars
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
 * Email Confirmation Response (202):
 * {
 *   "success": true,
 *   "data": {
 *     "requiresEmailConfirmation": true,
 *     "message": "Please check your email to confirm your account before signing in."
 *   }
 * }
 *
 * Error Responses:
 * - 400: Invalid input (validation errors)
 * - 409: Email already registered
 * - 500: Server error
 *
 * Example cURL:
 * ```bash
 * curl -X POST http://localhost:3000/api/signup \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "user@example.com",
 *     "password": "SecurePass123",
 *     "displayName": "John Doe"
 *   }'
 * ```
 *
 * Security:
 * - Never logs or returns plaintext passwords
 * - Never stores passwords in user_profiles (Supabase Auth handles it)
 * - Session cookies are set via @supabase/ssr
 * - Enforces 1MB request size limit
 */

import { createPostHandler } from '@/lib/http/handler';
import { ok, accepted } from '@/lib/http/response';
import { signupSchema } from '@/lib/validation/auth';
import { createUser } from '@/lib/users/service';
import { createServerClient } from '@/lib/supabase/server';
import { InternalServerError } from '@/lib/http/errors';

/**
 * Force dynamic rendering for this route
 * Prevents Next.js from statically optimizing this API route
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/signup handler
 *
 * The createPostHandler wrapper provides:
 * - Method enforcement (only POST allowed)
 * - JSON body parsing with size limit (1MB)
 * - Zod schema validation
 * - Automatic error handling and response formatting
 * - Request ID generation for tracing
 */
export const POST = createPostHandler(signupSchema, async (req, body) => {
  const { email, password, displayName } = body;

  console.log('🚀 [SIGNUP] Starting signup process for:', email);

  // Step 1: Create user (auth + profile)
  // This creates the auth user and profile, but doesn't sign them in yet
  const user = await createUser(body);
  console.log('✅ [SIGNUP] User created successfully:', {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    onboardingCompleted: user.onboardingCompleted,
  });

  // Step 2: Sign the user in to establish session cookies
  // Use the SSR client so it can set cookies via @supabase/ssr
  console.log('🔐 [SIGNUP] Attempting to sign in user to establish session...');
  const supabase = await createServerClient();

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Handle email confirmation requirement
  if (signInError) {
    // If error is due to email not being confirmed
    if (
      signInError.message?.includes('Email not confirmed') ||
      signInError.message?.includes('confirm your email')
    ) {
      console.log('📧 [SIGNUP] Email confirmation required');
      // Return 202 Accepted - account created but needs confirmation
      return accepted({
        requiresEmailConfirmation: true,
        message: 'Account created! Please check your email to confirm your account before signing in.',
      });
    }

    // Other sign-in errors are unexpected (user was just created)
    console.error('❌ [SIGNUP] Unexpected sign-in error after signup:', signInError);
    throw new InternalServerError(
      'Account created but automatic sign-in failed. Please try signing in manually.'
    );
  }

  console.log('🎉 [SIGNUP] Sign-in successful! Session established.');
  console.log('📝 [SIGNUP] Session details:', {
    userId: signInData.user.id,
    email: signInData.user.email,
    access_token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
    expires_at: signInData.session.expires_at,
    expires_in: signInData.session.expires_in,
    token_type: signInData.session.token_type,
  });

  console.log('🍪 [SIGNUP] Session cookies should now be set by Supabase SSR client');

  // Step 3: Return user profile and session
  // Session cookies are automatically set by the SSR client
  const response = ok({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      onboardingCompleted: user.onboardingCompleted,
    },
    session: {
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      expires_at: signInData.session.expires_at,
    },
  });

  console.log('✨ [SIGNUP] Signup complete! Returning response with session data.');
  
  return response;
});
