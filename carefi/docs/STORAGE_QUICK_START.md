# Storage Quick Start Guide

Quick reference for setting up and using Supabase Storage for user images.

## 🚀 Quick Setup (5 minutes)

### 1. Create Buckets in Supabase Dashboard

1. Go to **Storage** → **New bucket**
2. Create `images`:
   - Name: `images`
   - Public: ❌ **Unchecked** (private)
   - File size limit: **10 MB**
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

### 2. Run SQL Policies

Copy and paste the SQL from `supabase/storage_policies.sql` into your Supabase SQL Editor and run it.

### 3. Test Upload

```typescript
// From your frontend
const formData = new FormData();
formData.append('file', file);
formData.append('angle', 'front');

const response = await fetch('/api/uploadImage', {
  method: 'POST',
  body: formData,
});
```

## 📁 File Structure

```
lib/storage/
  ├── buckets.ts          # Bucket config & path utilities
  └── service.ts          # Upload/delete/list functions

app/api/uploadImage/
  └── route.ts            # Upload API endpoint

supabase/
  └── storage_policies.sql # RLS policies SQL

docs/
  ├── STORAGE_SETUP.md    # Detailed setup guide
  └── STORAGE_QUICK_START.md # This file
```

## 🔑 Key Functions

### Upload Image
```typescript
import { uploadImage } from '@/lib/storage/service';
import { createServerClient } from '@/lib/supabase/server';

const supabase = await createServerClient();
const result = await uploadImage(supabase, userId, file, {
  fileName: file.name,
  fileSize: file.size,
  mimeType: file.type,
  angle: 'front',
});
```

### Delete Image
```typescript
import { deleteImage } from '@/lib/storage/service';

await deleteImage(supabase, userId, storagePath);
```

### Get Signed URL (for private buckets)
```typescript
import { getSignedUrl } from '@/lib/storage/service';

const url = await getSignedUrl(supabase, storagePath, 3600); // 1 hour
```

## 📝 API Endpoint

**POST** `/api/uploadImage`

**Body (FormData):**
- `file`: File object
- `angle`: `'front' | 'left_45' | 'right_45'`

**Response:**
```json
{
  "success": true,
  "data": {
    "storageUrl": "https://...",
    "path": "user_id/front/filename.jpg",
    "fileName": "photo.jpg",
    "fileSize": 123456,
    "mimeType": "image/jpeg",
    "angle": "front"
  }
}
```

## 🔒 Security

- ✅ Private buckets (not public)
- ✅ RLS policies enforce user isolation
- ✅ File type validation (images only)
- ✅ File size limits (10MB)
- ✅ Path sanitization (prevents traversal)
- ✅ Authentication required

## 📚 Full Documentation

See `docs/STORAGE_SETUP.md` for detailed setup instructions and troubleshooting.

