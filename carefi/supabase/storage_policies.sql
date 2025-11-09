-- Supabase Storage RLS Policies
-- Run this SQL in your Supabase SQL Editor to set up storage bucket policies
--
-- Prerequisites:
-- 1. Create bucket: 'images' (via Dashboard or API)
-- 2. Ensure bucket is private (not public)

-- ============================================================================
-- STORAGE BUCKET POLICIES
-- ============================================================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- IMAGES BUCKET POLICIES
-- ============================================================================

-- Policy: Users can upload to their own folder
-- Path structure: {user_id}/{angle}_{filename}
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own images
CREATE POLICY "Users can view own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- USER-PHOTOS-THUMBNAILS BUCKET POLICIES (Optional)
-- ============================================================================

-- Policy: Users can upload thumbnails to their own folder
CREATE POLICY "Users can upload thumbnails to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own thumbnails
CREATE POLICY "Users can view own thumbnails"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-photos-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own thumbnails
CREATE POLICY "Users can delete own thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-photos-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- 1. These policies use storage.foldername(name)[1] to extract the first
--    folder name (user_id) from the storage path.
--
-- 2. The path structure is: {user_id}/{angle}_{filename}
--    Example: 550e8400-e29b-41d4-a716-446655440000/front_photo.jpg
--
-- 3. To test policies, try uploading an image with a different user_id
--    in the path - it should be rejected.
--
-- 4. If you need to modify or drop policies:
--    DROP POLICY "policy_name" ON storage.objects;
--
-- 5. To view existing policies:
--    SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

