import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { AnalysisSummary } from '@/lib/types';

/**
 * GET /api/analysis/latest
 *
 * Returns the latest skin analysis for the authenticated user
 *
 * Queries the skin_analyses table for the most recent completed analysis
 * and transforms it into the AnalysisSummary format for the dashboard.
 *
 * Response schema: AnalysisSummary
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'unauthorized', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    console.log(`[API] /api/analysis/latest - User ${user.id}`);

    // Query the most recent completed analysis
    const { data: analysis, error } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'complete')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle to return null if no rows found

    if (error) {
      console.error('[API] Database query error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'db_error', message: 'Failed to fetch analysis' } },
        { status: 500 }
      );
    }

    // No analysis found - return 204 No Content
    if (!analysis) {
      console.log('[API] No completed analysis found for user');
      return NextResponse.json(
        { success: true, data: null },
        { status: 200 }
      );
    }

    console.log('[API] Found analysis:', {
      id: analysis.id,
      completedAt: analysis.completed_at,
      traitsCount: analysis.detected_traits?.length || 0,
    });

    // Transform database row into AnalysisSummary
    const traits = (analysis.detected_traits || []) as Array<{
      id: string;
      name: string;
      severity: 'low' | 'moderate' | 'high';
      description: string;
    }>;

    // Extract severity scores for dashboard metrics
    const getTraitSeverity = (traitId: string): number => {
      const trait = traits.find((t) => t.id === traitId);
      if (!trait) return 0;

      const severityMap = {
        low: 25,
        moderate: 55,
        high: 85,
      };
      return severityMap[trait.severity];
    };

    // Infer skin type from traits (fallback to 'normal' if not determinable)
    let skinType: AnalysisSummary['skin_type'] = 'normal';
    const hasOiliness = traits.some((t) => t.id === 'oiliness' && t.severity !== 'low');
    const hasDryness = traits.some((t) => t.id === 'dryness' && t.severity !== 'low');
    const hasSensitivity = traits.some((t) => t.id === 'sensitivity' && t.severity !== 'low');

    if (hasOiliness && hasDryness) {
      skinType = 'combination';
    } else if (hasOiliness) {
      skinType = 'oily';
    } else if (hasDryness) {
      skinType = 'dry';
    } else if (hasSensitivity) {
      skinType = 'sensitive';
    }

    // Determine primary concern (highest severity trait)
    const sortedTraits = [...traits].sort((a, b) => {
      const severityOrder = { high: 3, moderate: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    const primaryConcern = sortedTraits[0]?.name || 'No major concerns';

    // Generate notes from traits
    const notes = traits
      .filter((t) => t.severity !== 'low')
      .map((t) => `${t.name}: ${t.description}`)
      .slice(0, 4); // Limit to 4 most relevant notes

    // Create single-point time series (latest analysis only)
    const summary: AnalysisSummary = {
      user_id: user.id,
      skin_type: skinType,
      confidence: (analysis.confidence_score || 0) / 100, // Convert to 0-1 scale
      primary_concern: primaryConcern,
      updatedAt: analysis.completed_at || analysis.created_at,
      series: [
        {
          date: analysis.completed_at || analysis.created_at,
          acne: getTraitSeverity('acne'),
          dryness: getTraitSeverity('dryness'),
          pigmentation: getTraitSeverity('hyperpigmentation'),
        },
      ],
      notes: notes.length > 0 ? notes : ['Analysis complete. Check your routine recommendations.'],
      modelVersion: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
      detected_traits: traits, // Include full trait details
    };

    console.log('[API] Returning analysis summary');
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[API] /api/analysis/latest error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'internal_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
