/**
 * Storage Test/Debug Endpoint
 * 
 * This endpoint helps diagnose storage bucket issues.
 * GET /api/storage/test
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { STORAGE_BUCKETS } from '@/lib/storage/buckets';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        authError: authError?.message,
      });
    }

    const results: any = {
      authenticated: true,
      userId: user.id,
      bucketName: STORAGE_BUCKETS.USER_PHOTOS,
      checks: {},
    };

    // Check 1: List bucket contents
    try {
      const { data: listData, error: listError } = await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .list('', {
          limit: 10,
        });

      results.checks.bucketExists = !listError;
      results.checks.bucketAccess = !listError;
      results.checks.listError = listError?.message || null;
      results.checks.items = listData?.length || 0;
    } catch (error: any) {
      results.checks.bucketExists = false;
      results.checks.bucketAccess = false;
      results.checks.listError = error.message;
    }

    // Check 2: Try to list user's folder
    try {
      const { data: userFolderData, error: userFolderError } = await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .list(user.id, {
          limit: 10,
        });

      results.checks.userFolderExists = !userFolderError;
      results.checks.userFolderAccess = !userFolderError;
      results.checks.userFolderError = userFolderError?.message || null;
      results.checks.userFolderItems = userFolderData?.length || 0;
      
      // List subfolders
      if (userFolderData && userFolderData.length > 0) {
        results.checks.userFolders = userFolderData.map((item) => ({
          name: item.name,
          id: item.id,
          isFolder: !item.id, // Folders don't have IDs
        }));
      }
    } catch (error: any) {
      results.checks.userFolderExists = false;
      results.checks.userFolderError = error.message;
    }

    // Check 3: Test upload permissions (dry run - just check if we can access)
    results.checks.canUpload = results.checks.bucketAccess;

    return NextResponse.json({
      success: true,
      ...results,
      recommendations: getRecommendations(results),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}

function getRecommendations(results: any): string[] {
  const recommendations: string[] = [];

  if (!results.checks.bucketExists) {
    recommendations.push(
      `❌ Bucket "${results.bucketName}" does not exist. Create it in Supabase Dashboard → Storage → New bucket`
    );
  }

  if (results.checks.bucketExists && !results.checks.bucketAccess) {
    recommendations.push(
      `❌ Cannot access bucket "${results.bucketName}". Check RLS policies in Supabase Dashboard → Storage → Policies`
    );
  }

  if (results.checks.listError?.includes('policy')) {
    recommendations.push(
      `❌ RLS Policy issue: ${results.checks.listError}. Run the SQL from supabase/storage_policies.sql`
    );
  }

  if (results.checks.bucketExists && results.checks.bucketAccess) {
    recommendations.push('✅ Bucket exists and is accessible');
  }

  if (results.checks.userFolderAccess) {
    recommendations.push(`✅ Can access user folder. Found ${results.checks.userFolderItems} items`);
  }

  return recommendations;
}

