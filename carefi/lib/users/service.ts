/**
 * User Service Layer
 *
 * Pure business logic functions for user management.
 * These functions are framework-agnostic and can be tested independently.
 *
 * Responsibilities:
 * - Creating auth users via Supabase Auth Admin API
 * - Inserting user profiles into the database
 * - Handling rollback on failures
 * - Managing user data lifecycle
 *
 * IMPORTANT: This module uses the Supabase service role (admin client)
 * Only call these functions from server-side code (API routes, server actions)
 */

import { getSupabaseAdmin } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/security/passwords';
import { ConflictError, InternalServerError, ErrorCodes } from '@/lib/http/errors';
import type { SignupInput } from '@/lib/validation/auth';

/**
 * User profile data returned after successful signup
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  onboardingCompleted: boolean;
}

/**
 * Create a new user in Supabase Auth
 *
 * @param {string} email - User email
 * @param {string} password - User password (will be hashed by Supabase)
 * @returns {Promise<string>} User ID
 * @throws {ConflictError} If email is already in use
 * @throws {InternalServerError} If user creation fails
 */
async function createAuthUser(email: string, password: string): Promise<string> {
  const admin = getSupabaseAdmin();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email (no verification email sent)
  });

  if (error) {
    // Check if error is due to duplicate email
    if (error.message?.includes('already registered') || error.status === 422) {
      throw new ConflictError('Email already registered', ErrorCodes.EMAIL_IN_USE);
    }

    console.error('Failed to create auth user:', error);
    throw new InternalServerError('Failed to create user account');
  }

  if (!data.user) {
    throw new InternalServerError('Failed to create user account');
  }

  return data.user.id;
}

/**
 * Insert user profile into the database
 *
 * @param {string} id - User ID (must match auth.users.id)
 * @param {string} email - User email
 * @param {string | null} displayName - User display name
 * @param {string} passwordHash - bcrypt password hash
 * @throws {InternalServerError} If profile creation fails
 */
async function insertUserProfile(
  id: string,
  email: string,
  displayName: string | null,
  passwordHash: string
): Promise<void> {
  const admin = getSupabaseAdmin();

  const { error } = await admin.from('user_profiles').insert({
    id,
    email,
    display_name: displayName,
    password: passwordHash,
    onboarding_completed: false,
  });

  if (error) {
    console.error('Failed to insert user profile:', error);
    throw new InternalServerError('Failed to create user profile');
  }
}

/**
 * Rollback auth user creation by deleting the user
 *
 * Called when profile insertion fails to maintain data consistency
 *
 * @param {string} userId - User ID to delete
 */
async function rollbackAuthUser(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();

  try {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Failed to rollback auth user:', error);
      // Don't throw - this is a cleanup operation
    }
  } catch (error) {
    console.error('Failed to rollback auth user:', error);
    // Don't throw - this is a cleanup operation
  }
}

/**
 * Create a new user account with auth user and profile
 *
 * This is the main entry point for user signup.
 * It performs the following steps:
 * 1. Create auth user via Supabase Auth Admin API
 * 2. Hash the password with bcrypt
 * 3. Insert user profile with hashed password
 * 4. If profile insertion fails, rollback auth user
 *
 * @param {SignupInput} input - Validated signup data
 * @returns {Promise<UserProfile>} Created user profile
 * @throws {ConflictError} If email is already in use
 * @throws {InternalServerError} If user creation fails
 *
 * @example
 * ```ts
 * const user = await createUser({
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   displayName: 'John Doe',
 * });
 * // Returns: { id: '...', email: '...', displayName: '...', onboardingCompleted: false }
 * ```
 */
export async function createUser(input: SignupInput): Promise<UserProfile> {
  const { email, password, displayName } = input;

  // Step 1: Create auth user
  const authUserId = await createAuthUser(email, password);

  try {
    // Step 2: Hash password for storage in user_profiles
    const passwordHash = await hashPassword(password);

    // Step 3: Insert user profile
    await insertUserProfile(authUserId, email, displayName || null, passwordHash);

    // Return sanitized user profile
    return {
      id: authUserId,
      email,
      displayName: displayName || null,
      onboardingCompleted: false,
    };
  } catch (error) {
    // Step 4: Rollback auth user if profile creation failed
    await rollbackAuthUser(authUserId);
    throw error;
  }
}

/**
 * Additional user service functions for future use
 */

/**
 * Get user profile by ID
 *
 * @param {string} userId - User ID
 * @returns {Promise<UserProfile | null>} User profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('user_profiles')
    .select('id, email, display_name, onboarding_completed')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email || '',
    displayName: data.display_name,
    onboardingCompleted: data.onboarding_completed,
  };
}

/**
 * Update user profile
 *
 * @param {string} userId - User ID
 * @param {Partial<UserProfile>} updates - Fields to update
 * @returns {Promise<UserProfile>} Updated user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'onboardingCompleted'>>
): Promise<UserProfile> {
  const admin = getSupabaseAdmin();

  const updateData: Record<string, unknown> = {};
  if (updates.displayName !== undefined) {
    updateData.display_name = updates.displayName;
  }
  if (updates.onboardingCompleted !== undefined) {
    updateData.onboarding_completed = updates.onboardingCompleted;
    if (updates.onboardingCompleted) {
      updateData.onboarding_completed_at = new Date().toISOString();
    }
  }

  const { data, error } = await admin
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)
    .select('id, email, display_name, onboarding_completed')
    .single();

  if (error || !data) {
    throw new InternalServerError('Failed to update user profile');
  }

  return {
    id: data.id,
    email: data.email || '',
    displayName: data.display_name,
    onboardingCompleted: data.onboarding_completed,
  };
}
