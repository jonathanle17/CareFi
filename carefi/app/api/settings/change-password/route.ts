import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ok, badRequest, unauthorized, internalServerError } from '@/lib/http/response';
import { BadRequestError, UnauthorizedError } from '@/lib/http/errors';

/**
 * Change Password API Route
 *
 * POST /api/settings/change-password
 *
 * Updates the user's password in Supabase Auth.
 * Requires current password for verification.
 *
 * Request Body:
 * {
 *   currentPassword: string
 *   newPassword: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: "Password updated successfully"
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError('You must be signed in to change your password');
    }

    // Parse request body
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // Validate inputs
    if (!currentPassword || typeof currentPassword !== 'string') {
      throw new BadRequestError('Current password is required');
    }

    if (!newPassword || typeof newPassword !== 'string') {
      throw new BadRequestError('New password is required');
    }

    // Validate new password format
    if (newPassword.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      throw new BadRequestError('Password must contain at least one letter and one number');
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Failed to update password:', updateError);
      throw new BadRequestError('Failed to update password. Please try again.');
    }

    return ok({
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return badRequest(error.message);
    }
    if (error instanceof UnauthorizedError) {
      return unauthorized(error.message);
    }

    console.error('Failed to change password:', error);
    return internalServerError('Failed to change password');
  }
}
