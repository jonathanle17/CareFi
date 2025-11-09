/**
 * Example: Upload Image to Supabase Storage
 *
 * This example shows how to use the uploadImage API endpoint
 * from a client component or page.
 */

import { ImageAngle, UploadImageResponse } from '@/lib/types';

/**
 * Upload a single image file
 */
export async function uploadImageFile(
  file: File,
  angle: ImageAngle
): Promise<UploadImageResponse> {
  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('angle', angle);

  // Make API request
  const response = await fetch('/api/uploadImage', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  return response.json();
}

/**
 * Example: Upload multiple images (one at a time)
 */
export async function uploadMultipleImages(
  files: File[],
  angles: ImageAngle[]
): Promise<UploadImageResponse[]> {
  if (files.length !== angles.length) {
    throw new Error('Files and angles arrays must have the same length');
  }

  const results: UploadImageResponse[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadImageFile(files[i], angles[i]);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload file ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Example: Upload image and save to database
 */
export async function uploadImageAndSaveToDatabase(
  file: File,
  angle: ImageAngle,
  supabase: any // Replace with your Supabase client type
) {
  // 1. Upload to storage
  const uploadResult = await uploadImageFile(file, angle);

  // 2. Save metadata to database
  const { data, error } = await supabase
    .from('uploaded_images')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      file_name: uploadResult.data.fileName,
      file_size_bytes: uploadResult.data.fileSize,
      mime_type: uploadResult.data.mimeType,
      angle: uploadResult.data.angle,
      storage_url: uploadResult.data.storageUrl,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save image metadata: ${error.message}`);
  }

  return {
    upload: uploadResult,
    database: data,
  };
}

/**
 * Example: React component usage
 */
/*
'use client';

import { useState } from 'react';
import { uploadImageFile } from '@/examples/storage/uploadImage.example';
import { ImageAngle } from '@/lib/types';

export function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadImageFile(file, 'front');
      console.log('Upload successful:', result);
      // Handle success (e.g., show success message, update UI)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
*/

