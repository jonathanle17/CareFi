/**
 * POST /api/signup
 *
 * Create a new user account with email and password.
 *
 * This endpoint:
 * 1. Validates the request body (email, password, displayName)
 * 2. Creates a Supabase Auth user with auto-confirmed email
 * 3. Hashes the password with bcrypt (12 rounds)
 * 4. Stores the hash in user_profiles.password
 * 5. Returns sanitized user data (no password or hash)
 * 6. Rolls back auth user if profile creation fails
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123",  // Min 8 chars, ≥1 letter, ≥1 number
 *   "displayName": "John Doe"     // Optional, max 80 chars
 * }
 *
 * Success Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "email": "user@example.com",
 *     "displayName": "John Doe",
 *     "onboardingCompleted": false
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
 * - Only stores bcrypt hashes in the database
 * - Enforces 1MB request size limit
 * - Auto-confirms email (no verification required)
 */

import { createPostHandler } from '@/lib/http/handler';
import { created } from '@/lib/http/response';
import { signupSchema } from '@/lib/validation/auth';
import { createUser } from '@/lib/users/service';

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
  // Create user (auth + profile)
  // This function handles:
  // - Creating Supabase Auth user
  // - Hashing password with bcrypt
  // - Inserting user profile
  // - Rolling back on failure
  const user = await createUser(body);

  // Return sanitized user data (no password or hash)
  return created({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    onboardingCompleted: user.onboardingCompleted,
  });
});
