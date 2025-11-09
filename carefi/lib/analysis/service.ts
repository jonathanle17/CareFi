/**
 * Analysis Service
 *
 * Orchestrates the end-to-end skin analysis flow:
 * 1. Creates analysis record with status tracking
 * 2. Fetches user images and generates signed URLs
 * 3. Calls OpenAI Vision API
 * 4. Saves results to database
 * 5. Returns dashboard-ready summary
 */

import { createServerClient } from '@/lib/supabase/server';
import { getSignedImageUrls, ImageRetrievalError } from '@/lib/storage/imageUtils';
import { callVision, VisionAnalysis, VisionAnalysisError } from '@/lib/ai/openai';
import type { AnalysisSummary } from '@/lib/types';

/**
 * Custom error for analysis service failures
 */
export class AnalysisServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = 'AnalysisServiceError';
  }
}

/**
 * Map VisionAnalysis to AnalysisSummary for dashboard consumption
 *
 * Transforms OpenAI Vision response into the format expected by the dashboard.
 * Creates a single-point time series with today's data.
 *
 * @param userId - User ID
 * @param visionResult - Validated OpenAI Vision result
 * @param completedAt - Completion timestamp
 * @returns Dashboard-ready AnalysisSummary
 */
export function mapVisionToSummary(
  userId: string,
  visionResult: VisionAnalysis,
  completedAt: string
): AnalysisSummary {
  // Extract severity scores for dashboard metrics
  // Default to 0 if trait not found
  const getTraitSeverity = (traitId: string): number => {
    const trait = visionResult.traits.find((t) => t.id === traitId);
    if (!trait) return 0;

    // Map severity to 0-100 scale
    const severityMap = {
      low: 25,
      moderate: 55,
      high: 85,
    };
    return severityMap[trait.severity];
  };

  // Map skin type from Vision format to dashboard format
  const skinTypeMap: Record<string, AnalysisSummary['skin_type']> = {
    Dry: 'dry',
    Oily: 'oily',
    Combination: 'combination',
    Normal: 'normal',
    Sensitive: 'sensitive',
  };

  const summary: AnalysisSummary = {
    user_id: userId,
    skin_type: skinTypeMap[visionResult.skinType] || 'normal',
    confidence: visionResult.confidence / 100, // Convert 0-100 to 0-1
    primary_concern: visionResult.primaryConcern,
    updatedAt: completedAt,
    series: [
      {
        date: completedAt,
        acne: getTraitSeverity('acne'),
        dryness: getTraitSeverity('dryness'),
        pigmentation: getTraitSeverity('hyperpigmentation'),
      },
    ],
    notes: visionResult.notes,
    modelVersion: visionResult.modelVersion,
  };

  return summary;
}

/**
 * Start OpenAI Vision analysis for a user
 *
 * This is the main orchestration function that:
 * 1. Creates a skin_analyses record with initial status
 * 2. Fetches and validates user images
 * 3. Generates signed URLs for OpenAI access
 * 4. Calls OpenAI Vision API
 * 5. Updates database with results
 * 6. Returns normalized summary for dashboard
 *
 * Status lifecycle:
 * - 'uploading': Initial state, checking for images
 * - 'screening': Generating signed URLs
 * - 'detecting': Calling OpenAI Vision
 * - 'generating': Processing results
 * - 'complete': Analysis finished successfully
 * - 'error': Analysis failed (error_message populated)
 *
 * @param userId - User ID to analyze
 * @returns AnalysisSummary for dashboard display
 * @throws AnalysisServiceError on failures
 */
export async function startOpenAIVisionAnalysis(userId: string): Promise<AnalysisSummary> {
  console.log(`[AnalysisService] Starting analysis for user ${userId}`);

  const supabase = await createServerClient();
  let analysisId: string | null = null;

  try {
    // Step 1: Create analysis record with status 'uploading'
    console.log('[AnalysisService] Creating analysis record...');
    const { data: analysisRow, error: createError } = await supabase
      .from('skin_analyses')
      .insert({
        user_id: userId,
        status: 'uploading',
        detected_traits: [],
        image_ids: [],
      })
      .select('id')
      .single();

    if (createError || !analysisRow) {
      throw new AnalysisServiceError(
        `Failed to create analysis record: ${createError?.message}`,
        'db_create_failed',
        'Could not start analysis. Please try again.'
      );
    }

    analysisId = analysisRow.id;
    console.log(`[AnalysisService] Created analysis ${analysisId}`);

    // Step 2: Fetch signed URLs for the 3 images → status 'screening'
    console.log('[AnalysisService] Updating status to screening...');
    await supabase
      .from('skin_analyses')
      .update({ status: 'screening' })
      .eq('id', analysisId);

    console.log('[AnalysisService] Fetching signed URLs...');
    const { urls, imageIds } = await getSignedImageUrls(supabase, userId);

    console.log('[AnalysisService] URLs generated:', {
      count: urls.length,
      imageIds,
    });

    // Step 3: Call OpenAI → status 'detecting'
    console.log('[AnalysisService] Updating status to detecting...');
    await supabase
      .from('skin_analyses')
      .update({ status: 'detecting' })
      .eq('id', analysisId);

    console.log('[AnalysisService] Calling OpenAI Vision...');
    const visionResult = await callVision(urls);

    // Step 4: Process results → status 'generating'
    console.log('[AnalysisService] Updating status to generating...');
    await supabase
      .from('skin_analyses')
      .update({ status: 'generating' })
      .eq('id', analysisId);

    // Step 5: Save to database → status 'complete'
    const completedAt = new Date().toISOString();
    console.log('[AnalysisService] Saving results to database...');

    const { error: updateError } = await supabase
      .from('skin_analyses')
      .update({
        detected_traits: visionResult.traits,
        confidence_score: visionResult.confidence,
        image_ids: imageIds,
        completed_at: completedAt,
        status: 'complete',
      })
      .eq('id', analysisId);

    if (updateError) {
      throw new AnalysisServiceError(
        `Failed to save analysis results: ${updateError.message}`,
        'db_update_failed',
        'Analysis completed but could not save results. Please try again.'
      );
    }

    console.log('[AnalysisService] Analysis complete!');

    // Step 6: Return normalized summary
    const summary = mapVisionToSummary(userId, visionResult, completedAt);
    return summary;
  } catch (error) {
    console.error('[AnalysisService] Error during analysis:', error);

    // Update analysis record with error status
    if (analysisId) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      await supabase
        .from('skin_analyses')
        .update({
          status: 'error',
          error_message: errorMessage,
        })
        .eq('id', analysisId);
    }

    // Re-throw with user-friendly message
    if (error instanceof ImageRetrievalError) {
      throw new AnalysisServiceError(
        error.message,
        'missing_images',
        'Please upload all three required images (front, left 45°, right 45°) before starting analysis.'
      );
    }

    if (error instanceof VisionAnalysisError) {
      throw new AnalysisServiceError(
        error.message,
        'vision_api_failed',
        'Our skin analysis service is temporarily unavailable. Please try again in a few moments.'
      );
    }

    if (error instanceof AnalysisServiceError) {
      throw error;
    }

    // Unknown error
    throw new AnalysisServiceError(
      error instanceof Error ? error.message : 'Unknown error',
      'unknown_error',
      'An unexpected error occurred. Please try again.'
    );
  }
}
