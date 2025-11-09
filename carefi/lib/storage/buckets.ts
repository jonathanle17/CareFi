/**
 * Supabase Storage Bucket Configuration
 *
 * This module defines bucket names and configuration constants
 * for Supabase Storage buckets used in the CareFi application.
 */

/**
 * Storage bucket names
 * These must match the buckets created in your Supabase project
 */
export const STORAGE_BUCKETS = {
  /** User uploaded photos (full resolution) */
  USER_PHOTOS: 'images',
  /** Thumbnail versions of user photos */
  USER_PHOTOS_THUMBNAILS: 'user-photos-thumbnails',
} as const;

/**
 * Allowed MIME types for image uploads
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  /** Maximum size for full resolution images */
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  /** Maximum size for thumbnails */
  MAX_THUMBNAIL_SIZE: 2 * 1024 * 1024, // 2MB
} as const;

/**
 * Image angle types (matches database schema)
 */
export type ImageAngle = 'front' | 'left_45' | 'right_45';

/**
 * Generate storage path for user image
 * Format: {user_id}/{angle}_{filename}
 * All images are stored directly under the user folder
 *
 * @param userId - User ID (UUID)
 * @param angle - Image angle (front, left_45, right_45)
 * @param filename - Original filename
 * @returns Storage path string
 */
export function generateImagePath(
  userId: string,
  angle: ImageAngle,
  filename: string
): string {
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Include angle in filename prefix to identify the image type
  // Format: {user_id}/{angle}_{filename}
  return `${userId}/${angle}_${sanitizedFilename}`;
}

/**
 * Generate thumbnail path for user image
 * Format: {user_id}/thumb_{angle}_{filename}
 *
 * @param userId - User ID (UUID)
 * @param angle - Image angle
 * @param filename - Original filename
 * @returns Storage path string for thumbnail
 */
export function generateThumbnailPath(
  userId: string,
  angle: ImageAngle,
  filename: string
): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/thumb_${angle}_${sanitizedFilename}`;
}

