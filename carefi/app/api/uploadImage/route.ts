/**
 * Image Upload API Route
 *
 * Handles file uploads to Supabase Storage for user images.
 * Validates file type, size, and user authentication.
 *
 * POST /api/uploadImage
 * Body: FormData with:
 *   - file: File object
 *   - angle: 'front' | 'left_45' | 'right_45'
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { uploadImage } from '@/lib/storage/service';
import { ImageAngle } from '@/lib/storage/buckets';
import { z } from 'zod';

// Validation schema
const uploadSchema = z.object({
  angle: z.enum(['front', 'left_45', 'right_45']),
});

/**
 * POST /api/uploadImage
 * Upload an image file to Supabase Storage
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[UPLOAD] ========================================');
  console.log('[UPLOAD] Image upload request received');

  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[UPLOAD] ❌ Unauthorized - No authenticated user');
      console.log('[UPLOAD] Auth error:', authError?.message || 'User not found');
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to upload images.' },
        { status: 401 }
      );
    }

    console.log('[UPLOAD] ✅ User authenticated:', {
      userId: user.id,
      email: user.email,
    });

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const angle = formData.get('angle') as string | null;

    // Validate required fields
    if (!file) {
      console.log('[UPLOAD] ❌ Validation failed - Missing file');
      return NextResponse.json(
        { error: 'Missing required field: file' },
        { status: 400 }
      );
    }

    if (!angle) {
      console.log('[UPLOAD] ❌ Validation failed - Missing angle');
      return NextResponse.json(
        { error: 'Missing required field: angle' },
        { status: 400 }
      );
    }

    console.log('[UPLOAD] 📄 File details:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileSizeBytes: file.size,
      mimeType: file.type,
      angle: angle,
    });

    // Validate angle value
    const validationResult = uploadSchema.safeParse({ angle });
    if (!validationResult.success) {
      console.log('[UPLOAD] ❌ Validation failed - Invalid angle:', angle);
      console.log('[UPLOAD] Validation errors:', validationResult.error.issues);
      return NextResponse.json(
        {
          error: 'Invalid angle value. Must be one of: front, left_45, right_45',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('[UPLOAD] ❌ Validation failed - Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Only image files are allowed.' },
        { status: 400 }
      );
    }

    console.log('[UPLOAD] ✅ Validation passed - Starting upload to Supabase Storage...');

    // Upload image to storage
    const uploadStartTime = Date.now();
    const uploadResult = await uploadImage(supabase, user.id, file, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      angle: angle as ImageAngle,
    });

    const uploadDuration = Date.now() - uploadStartTime;

    console.log('[UPLOAD] ✅ Upload to storage successful!');
    console.log('[UPLOAD] 📦 Storage details:', {
      path: uploadResult.path,
      storageUrl: uploadResult.storageUrl,
      uploadDuration: `${uploadDuration}ms`,
    });

    // Save metadata to uploaded_images table
    console.log('[UPLOAD] 💾 Saving image metadata to database...');
    const dbStartTime = Date.now();
    
    const { data: imageRecord, error: dbError } = await supabase
      .from('uploaded_images')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
        angle: angle as ImageAngle,
        storage_url: uploadResult.storageUrl,
        thumbnail_url: uploadResult.thumbnailUrl || null,
        original_last_modified: file.lastModified
          ? new Date(file.lastModified).toISOString()
          : null,
      })
      .select()
      .single();

    const dbDuration = Date.now() - dbStartTime;
    const totalDuration = Date.now() - startTime;

    if (dbError) {
      console.error('[UPLOAD] ❌ Failed to save image metadata:', {
        error: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint,
      });
      
      // Note: The file is already uploaded to storage, but metadata save failed
      // You might want to handle this differently (e.g., retry or cleanup)
      return NextResponse.json(
        {
          error: 'Image uploaded to storage but failed to save metadata',
          details: dbError.message,
          storageUrl: uploadResult.storageUrl, // Still return the storage URL
        },
        { status: 500 }
      );
    }

    console.log('[UPLOAD] ✅ Image metadata saved to database:', {
      imageId: imageRecord.id,
      dbDuration: `${dbDuration}ms`,
      totalDuration: `${totalDuration}ms`,
    });
    console.log('[UPLOAD] ========================================');

    // Return success response with storage URL and database record
    return NextResponse.json(
      {
        success: true,
        data: {
          id: imageRecord.id,
          storageUrl: uploadResult.storageUrl,
          path: uploadResult.path,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          angle: angle,
          createdAt: imageRecord.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('[UPLOAD] ❌ Upload failed after', `${totalDuration}ms`);
    console.error('[UPLOAD] Error details:', error);

    // Handle known errors
    if (error instanceof Error) {
      console.error('[UPLOAD] Error message:', error.message);
      console.error('[UPLOAD] Error stack:', error.stack);
      console.log('[UPLOAD] ========================================');
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Handle unknown errors
    console.error('[UPLOAD] Unknown error type:', typeof error);
    console.log('[UPLOAD] ========================================');
    return NextResponse.json(
      { error: 'An unexpected error occurred while uploading the image.' },
      { status: 500 }
    );
  }
}

