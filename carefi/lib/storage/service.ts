/**
 * Supabase Storage Service
 *
 * Provides utilities for uploading, retrieving, and managing files
 * in Supabase Storage buckets with proper authentication and RLS.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  STORAGE_BUCKETS,
  ALLOWED_IMAGE_TYPES,
  FILE_SIZE_LIMITS,
  ImageAngle,
  generateImagePath,
  generateThumbnailPath,
} from './buckets';

export interface UploadImageResult {
  storageUrl: string;
  thumbnailUrl?: string;
  path: string;
  thumbnailPath?: string;
}

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  angle: ImageAngle;
}

/**
 * Upload an image file to Supabase Storage
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - User ID (must match authenticated user)
 * @param file - File object to upload
 * @param metadata - Image metadata (fileName, fileSize, mimeType, angle)
 * @returns Upload result with storage URLs
 * @throws Error if upload fails or validation fails
 */
export async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  file: File | Blob,
  metadata: ImageMetadata
): Promise<UploadImageResult> {
  console.log('[STORAGE] Starting image upload to Supabase Storage...');
  console.log('[STORAGE] Bucket:', STORAGE_BUCKETS.USER_PHOTOS);
  console.log('[STORAGE] User ID:', userId);

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(metadata.mimeType as any)) {
    console.error('[STORAGE] ❌ Invalid file type:', metadata.mimeType);
    throw new Error(
      `Invalid file type: ${metadata.mimeType}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    );
  }
  console.log('[STORAGE] ✅ File type validated:', metadata.mimeType);

  // Validate file size
  if (metadata.fileSize > FILE_SIZE_LIMITS.MAX_IMAGE_SIZE) {
    console.error('[STORAGE] ❌ File size exceeds limit:', {
      fileSize: metadata.fileSize,
      maxSize: FILE_SIZE_LIMITS.MAX_IMAGE_SIZE,
    });
    throw new Error(
      `File size exceeds limit: ${metadata.fileSize} bytes. Maximum: ${FILE_SIZE_LIMITS.MAX_IMAGE_SIZE} bytes`
    );
  }
  console.log('[STORAGE] ✅ File size validated:', {
    size: `${(metadata.fileSize / 1024).toFixed(2)} KB`,
    maxSize: `${(FILE_SIZE_LIMITS.MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)} MB`,
  });

  // Generate storage paths
  const storagePath = generateImagePath(userId, metadata.angle, metadata.fileName);
  const thumbnailPath = generateThumbnailPath(userId, metadata.angle, metadata.fileName);
  console.log('[STORAGE] Generated paths:', {
    storagePath,
    thumbnailPath,
  });

  // Upload full resolution image
  console.log('[STORAGE] Uploading to Supabase Storage...');
  const uploadStartTime = Date.now();
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_PHOTOS)
    .upload(storagePath, file, {
      contentType: metadata.mimeType,
      upsert: false, // Don't overwrite existing files
      cacheControl: '3600', // Cache for 1 hour
    });

  const uploadDuration = Date.now() - uploadStartTime;

  if (uploadError) {
    console.error('[STORAGE] ❌ Upload failed:', {
      error: uploadError.message,
      duration: `${uploadDuration}ms`,
      fullError: uploadError,
    });

    // Provide more helpful error messages
    let errorMessage = uploadError.message;
    
    if (uploadError.message?.includes('policy') || uploadError.message?.includes('permission')) {
      errorMessage = `Upload failed due to RLS policy: ${uploadError.message}. Please check your storage policies in Supabase Dashboard.`;
    } else if (uploadError.message?.includes('Bucket not found')) {
      errorMessage = `Bucket "${STORAGE_BUCKETS.USER_PHOTOS}" not found. Please create it in Supabase Dashboard → Storage.`;
    } else if (uploadError.message?.includes('already exists')) {
      errorMessage = `File already exists at path: ${storagePath}. Try uploading with a different filename.`;
    }

    throw new Error(errorMessage);
  }

  console.log('[STORAGE] ✅ File uploaded successfully:', {
    path: storagePath,
    duration: `${uploadDuration}ms`,
    uploadData: uploadData ? { id: uploadData.id, path: uploadData.path } : null,
  });

  // Get public URL for the uploaded image
  console.log('[STORAGE] Generating public URL...');
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.USER_PHOTOS)
    .getPublicUrl(storagePath);

  if (!urlData?.publicUrl) {
    console.error('[STORAGE] ❌ Failed to generate storage URL');
    throw new Error('Failed to generate storage URL');
  }

  console.log('[STORAGE] ✅ Public URL generated:', urlData.publicUrl);

  const result: UploadImageResult = {
    storageUrl: urlData.publicUrl,
    path: storagePath,
  };

  // TODO: Generate and upload thumbnail if needed
  // For now, we'll skip thumbnails and add them later if needed
  // You can use a library like sharp or jimp to generate thumbnails

  console.log('[STORAGE] Upload complete!');
  return result;
}

/**
 * Delete an image from Supabase Storage
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - User ID (must match authenticated user)
 * @param path - Storage path to delete
 * @returns Success status
 */
export async function deleteImage(
  supabase: SupabaseClient,
  userId: string,
  path: string
): Promise<boolean> {
  // Verify path belongs to user (security check)
  if (!path.startsWith(`${userId}/`)) {
    throw new Error('Invalid path: does not belong to user');
  }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_PHOTOS)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  return true;
}

/**
 * Get a signed URL for private image access
 * Use this for private buckets where you need temporary access
 *
 * @param supabase - Authenticated Supabase client
 * @param path - Storage path
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_PHOTOS)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message || 'Unknown error'}`);
  }

  return data.signedUrl;
}

/**
 * List all images for a user
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - User ID
 * @returns Array of file paths
 */
export async function listUserImages(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_PHOTOS)
    .list(userId, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }

  // Flatten the directory structure and return all file paths
  const paths: string[] = [];
  for (const folder of data || []) {
    if (folder.id) {
      // This is a folder, list its contents
      const { data: folderData } = await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .list(`${userId}/${folder.name}`);

      if (folderData) {
        paths.push(...folderData.map((file) => `${userId}/${folder.name}/${file.name}`));
      }
    }
  }

  return paths;
}

