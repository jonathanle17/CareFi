/**
 * Image Utilities for OpenAI Vision Integration
 *
 * Provides functions to fetch user images and generate signed URLs
 * for secure, time-limited access to images stored in Supabase Storage.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ImageAngle, STORAGE_BUCKETS } from './buckets';
import { UploadedImageRecord } from './images';

/**
 * Custom error for image retrieval failures
 */
export class ImageRetrievalError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ImageRetrievalError';
  }
}

/**
 * Get the most recent uploaded image for each specified angle
 *
 * @param supabase - Authenticated Supabase client (with RLS)
 * @param userId - User ID to fetch images for
 * @param angles - Array of angles to retrieve
 * @returns Array of image records (one per angle, in same order as angles param)
 * @throws ImageRetrievalError if any required angle is missing
 */
export async function getUserImagesForAngles(
  supabase: SupabaseClient,
  userId: string,
  angles: ImageAngle[]
): Promise<UploadedImageRecord[]> {
  const results: UploadedImageRecord[] = [];

  for (const angle of angles) {
    const { data, error } = await supabase
      .from('uploaded_images')
      .select('*')
      .eq('user_id', userId)
      .eq('angle', angle)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      throw new ImageRetrievalError(
        `Missing required image for angle: ${angle}`,
        'missing_image'
      );
    }

    results.push(data as UploadedImageRecord);
  }

  return results;
}

/**
 * Generate a signed URL for secure, temporary access to a stored image
 *
 * Signed URLs expire after a short time to prevent unauthorized access.
 * Use for sending images to external APIs (like OpenAI) that need temporary access.
 *
 * @param supabase - Authenticated Supabase client
 * @param storagePath - Path to the file in Supabase Storage (e.g., "userId/front_image.jpg")
 * @param expiresInSeconds - URL expiration time in seconds (default: 360 = 6 minutes)
 * @returns Signed URL string
 * @throws ImageRetrievalError if URL generation fails
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds: number = 360
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_PHOTOS)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error('[ImageUtils] Failed to create signed URL:', {
      path: storagePath,
      error: error?.message,
    });
    throw new ImageRetrievalError(
      `Failed to create signed URL: ${error?.message || 'Unknown error'}`,
      'signed_url_failed'
    );
  }

  return data.signedUrl;
}

/**
 * Extract storage path from storage_url
 *
 * Supabase storage URLs have format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
 * We need to extract the {path} portion for signed URL generation.
 *
 * @param storageUrl - Full storage URL from database
 * @param bucketName - Expected bucket name
 * @returns Storage path (e.g., "userId/front_image.jpg")
 * @throws ImageRetrievalError if URL format is invalid
 */
function extractStoragePath(storageUrl: string, bucketName: string): string {
  try {
    const url = new URL(storageUrl);
    const pathParts = url.pathname.split('/');

    // Find bucket name in path and extract everything after it
    const bucketIndex = pathParts.indexOf(bucketName);
    if (bucketIndex === -1) {
      throw new Error('Bucket not found in URL');
    }

    const storagePath = pathParts.slice(bucketIndex + 1).join('/');
    if (!storagePath) {
      throw new Error('No path after bucket name');
    }

    return storagePath;
  } catch (error) {
    throw new ImageRetrievalError(
      `Invalid storage URL format: ${storageUrl}`,
      'invalid_storage_url'
    );
  }
}

/**
 * Result from getSignedImageUrls containing all required data
 */
export interface SignedImageUrlsResult {
  rows: UploadedImageRecord[];
  urls: string[];
  imageIds: string[];
}

/**
 * Get signed URLs for all three required user images
 *
 * This is the main function used by the analysis service.
 * It fetches the three required angles, validates they exist,
 * and generates short-lived signed URLs for OpenAI Vision.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - User ID to fetch images for
 * @returns Object containing image records, signed URLs, and image IDs
 * @throws ImageRetrievalError if images are missing or URL generation fails
 */
export async function getSignedImageUrls(
  supabase: SupabaseClient,
  userId: string
): Promise<SignedImageUrlsResult> {
  const requiredAngles: ImageAngle[] = ['front', 'left_45', 'right_45'];

  console.log(`[ImageUtils] Fetching images for user ${userId}`);

  // Fetch one image per required angle
  const rows = await getUserImagesForAngles(supabase, userId, requiredAngles);

  console.log(`[ImageUtils] Found ${rows.length} images:`, {
    angles: rows.map((r) => r.angle),
    imageIds: rows.map((r) => r.id),
  });

  // Generate signed URLs for each image
  const urls: string[] = [];
  for (const row of rows) {
    // Extract storage path from storage_url
    const storagePath = extractStoragePath(row.storage_url, STORAGE_BUCKETS.USER_PHOTOS);

    console.log(`[ImageUtils] Generating signed URL for ${row.angle}:`, {
      storagePath,
      expiresIn: '360s',
    });

    const signedUrl = await getSignedUrl(supabase, storagePath, 360);
    urls.push(signedUrl);
  }

  const imageIds = rows.map((r) => r.id);

  console.log(`[ImageUtils] Successfully generated ${urls.length} signed URLs`);

  return {
    rows,
    urls,
    imageIds,
  };
}
