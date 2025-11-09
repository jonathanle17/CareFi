# Supabase Storage Setup Guide

This guide walks you through setting up Supabase Storage buckets for user images in the CareFi application.

## Overview

CareFi uses Supabase Storage to store user-uploaded facial images. The setup includes:
- **images** bucket: Full resolution images

## Prerequisites

- Supabase project created
- Supabase CLI installed (optional, for programmatic setup)
- Environment variables configured (see `lib/env.ts`)

## Step 1: Create Storage Buckets

### Option A: Using Supabase Dashboard (Recommended)

1. **Navigate to Storage**
   - Go to your Supabase project dashboard
   - Click on **Storage** in the left sidebar

2. **Create `images` Bucket**
   - Click **New bucket**
   - Name: `images`
   - **Public bucket**: ❌ Unchecked (private bucket)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
   - Click **Create bucket**

### Option B: Using Supabase CLI

If you prefer programmatic setup, you can use the Supabase CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Create buckets using SQL (see Step 2 for RLS policies)
```

## Step 2: Configure Row Level Security (RLS) Policies

Storage buckets need RLS policies to ensure users can only access their own images.

### Using Supabase Dashboard

1. **Navigate to Storage Policies**
   - Go to **Storage** → **Policies**
   - Select the `images` bucket

2. **Create Upload Policy**
   - Click **New Policy**
   - Policy name: `Users can upload to own folder`
   - Policy definition:
   ```sql
   (bucket_id = 'images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
   ```
   - Allowed operations: ✅ INSERT
   - Click **Save**

3. **Create Select Policy**
   - Click **New Policy**
   - Policy name: `Users can view own images`
   - Policy definition:
   ```sql
   (bucket_id = 'images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
   ```
   - Allowed operations: ✅ SELECT
   - Click **Save**

4. **Create Delete Policy** (Optional)
   - Click **New Policy**
   - Policy name: `Users can delete own images`
   - Policy definition:
   ```sql
   (bucket_id = 'images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
   ```
   - Allowed operations: ✅ DELETE
   - Click **Save**


### Using SQL Editor

Alternatively, you can run these SQL commands in the Supabase SQL Editor:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload to their own folder
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
```

## Step 3: Verify Environment Variables

Ensure your `.env.local` file includes:

```env
SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Security Note**: Never commit `.env.local` to version control.

## Step 4: Test the Setup

### Test Upload via API

You can test the upload endpoint using curl or a tool like Postman:

```bash
curl -X POST http://localhost:3000/api/uploadImage \
  -H "Cookie: your-auth-cookie" \
  -F "file=@/path/to/image.jpg" \
  -F "angle=front"
```

Or use the provided HTTP file:

```http
POST http://localhost:3000/api/uploadImage
Content-Type: multipart/form-data

file=@example-front.jpeg
angle=front
```

### Test from Frontend

1. Sign in to your application
2. Navigate to `/upload`
3. Upload an image using the UploadZone component
4. Check Supabase Storage dashboard to verify the file was uploaded

## Storage Path Structure

Images are stored directly under the user folder with the angle as a filename prefix:

```
images/
  {user_id}/
    front_{filename}.jpg
    left_45_{filename}.jpg
    right_45_{filename}.jpg
```

Example:
```
images/
  550e8400-e29b-41d4-a716-446655440000/
    front_photo_2024_01_15.jpg
    left_45_photo_2024_01_15.jpg
    right_45_photo_2024_01_15.jpg
```

**Note:** The angle information is stored in both:
- The filename prefix (for easy identification in storage)
- The `uploaded_images` database table (for querying and linking)

## Security Considerations

1. **Private Bucket**: The bucket is private (not public) to ensure only authenticated users can access images.

2. **RLS Policies**: RLS policies ensure users can only:
   - Upload to their own `{user_id}` folder
   - View images in their own folder
   - Delete images from their own folder

3. **File Validation**: The API route validates:
   - File type (only images allowed)
   - File size (max 10MB for full images)
   - User authentication (must be signed in)
   - Path structure (prevents path traversal)

4. **Path Sanitization**: Filenames are sanitized to prevent path traversal attacks.

## Troubleshooting

### Error: "Bucket not found"
- Verify the bucket name matches exactly: `images`
- Check that the bucket was created successfully in the dashboard

### Error: "New row violates row-level security policy"
- Verify RLS policies are correctly configured
- Check that policies allow INSERT operations
- Verify the authenticated user ID matches the folder structure

### Error: "File size exceeds limit"
- Check the bucket's file size limit (should be 10MB)
- Verify the file you're uploading is under the limit

### Error: "Invalid file type"
- Check that the file MIME type is one of: `image/jpeg`, `image/png`, `image/webp`
- Verify the bucket's allowed MIME types configuration

## Next Steps

After setting up storage:

1. **Update Database**: The `uploaded_images` table stores metadata about uploaded images. After uploading, insert a record:

```typescript
const { data, error } = await supabase
  .from('uploaded_images')
  .insert({
    user_id: userId,
    file_name: fileName,
    file_size_bytes: fileSize,
    mime_type: mimeType,
    angle: angle,
    storage_url: storageUrl,
  });
```

2. **Generate Thumbnails**: Consider implementing thumbnail generation using a library like `sharp` or `jimp` for better performance.

3. **Image Processing**: You may want to add image optimization, compression, or resizing before storage.

## Related Files

- `lib/storage/buckets.ts` - Bucket configuration and path utilities
- `lib/storage/service.ts` - Storage service functions
- `app/api/uploadImage/route.ts` - Upload API endpoint
- `supabase/schema.sql` - Database schema (includes `uploaded_images` table)

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage API Reference](https://supabase.com/docs/reference/javascript/storage)

