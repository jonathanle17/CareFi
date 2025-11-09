import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateUserProfile } from '@/lib/users/service';
import { ok, badRequest, unauthorized, internalServerError } from '@/lib/http/response';
import { BadRequestError, UnauthorizedError } from '@/lib/http/errors';

/**
 * Update Display Name API Route
 *
 * POST /api/settings/update-display-name
 *
 * Updates the user's display name in their profile.
 *
 * Request Body:
 * {
 *   displayName: string | null
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     displayName: string | null
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
      throw new UnauthorizedError('You must be signed in to update your profile');
    }

    // Parse request body
    const body = await req.json();
    const { displayName } = body;

    // Validate display name (optional, max 80 chars)
    if (displayName !== null && displayName !== undefined) {
      if (typeof displayName !== 'string') {
        throw new BadRequestError('Display name must be a string');
      }
      if (displayName.length > 80) {
        throw new BadRequestError('Display name must be 80 characters or less');
      }
    }

    // Update user profile
    const updatedProfile = await updateUserProfile(user.id, {
      displayName: displayName?.trim() || null,
    });

    return ok({
      displayName: updatedProfile.displayName,
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return badRequest(error.message);
    }
    if (error instanceof UnauthorizedError) {
      return unauthorized(error.message);
    }

    console.error('Failed to update display name:', error);
    return internalServerError('Failed to update display name');
  }
}
