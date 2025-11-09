/**
 * Image Database Service
 *
 * Helper functions for querying and managing uploaded_images records
 * in the database (separate from storage operations).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ImageAngle } from './buckets';

export interface UploadedImageRecord {
  id: string;
  user_id: string;
  created_at: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  angle: ImageAngle;
  storage_url: string;
  thumbnail_url: string | null;
  original_last_modified: string | null;
  deleted_at: string | null;
}

/**
 * Get all uploaded images for a user
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - User ID
 * @returns Array of uploaded image records
 */
export async function getUserImages(
  supabase: SupabaseClient,
  userId: string
): Promise<UploadedImageRecord[]> {
  const { data, error } = await supabase
    .from('uploaded_images')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user images: ${error.message}`);
  }

  return (data || []) as UploadedImageRecord[];
}

/**
 * Get images by angle for a user
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - User ID
 * @param angle - Image angle to filter by
 * @returns Array of uploaded image records
 */
export async function getUserImagesByAngle(
  supabase: SupabaseClient,
  userId: string,
  angle: ImageAngle
): Promise<UploadedImageRecord[]> {
  const { data, error } = await supabase
    .from('uploaded_images')
    .select('*')
    .eq('user_id', userId)
    .eq('angle', angle)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch images by angle: ${error.message}`);
  }

  return (data || []) as UploadedImageRecord[];
}

/**
 * Get a specific image by ID
 *
 * @param supabase - Authenticated Supabase client
 * @param imageId - Image record ID
 * @returns Uploaded image record or null
 */
export async function getImageById(
  supabase: SupabaseClient,
  imageId: string
): Promise<UploadedImageRecord | null> {
  const { data, error } = await supabase
    .from('uploaded_images')
    .select('*')
    .eq('id', imageId)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch image: ${error.message}`);
  }

  return data as UploadedImageRecord;
}

/**
 * Soft delete an image (sets deleted_at timestamp)
 *
 * @param supabase - Authenticated Supabase client
 * @param imageId - Image record ID
 * @returns Success status
 */
export async function softDeleteImage(
  supabase: SupabaseClient,
  imageId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('uploaded_images')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', imageId);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  return true;
}

/**
 * Check if user has all required angles uploaded
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - User ID
 * @returns Object with status for each angle
 */
export async function checkRequiredAngles(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  front: boolean;
  left_45: boolean;
  right_45: boolean;
  allComplete: boolean;
}> {
  const images = await getUserImages(supabase, userId);
  
  const angles = {
    front: images.some((img) => img.angle === 'front'),
    left_45: images.some((img) => img.angle === 'left_45'),
    right_45: images.some((img) => img.angle === 'right_45'),
  };

  return {
    ...angles,
    allComplete: angles.front && angles.left_45 && angles.right_45,
  };
}

