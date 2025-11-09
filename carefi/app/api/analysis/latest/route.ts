import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { AnalysisSummary } from '@/lib/types';

/**
 * GET /api/analysis/latest
 *
 * Returns the latest skin analysis for the authenticated user
 *
 * MOCK IMPLEMENTATION:
 * - Currently returns deterministic sample data
 * - Replace with real analysis service integration later
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Replace with real query to skin_analyses table
    // const { data: analysis, error } = await supabase
    //   .from('skin_analyses')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .eq('status', 'complete')
    //   .order('completed_at', { ascending: false })
    //   .limit(1)
    //   .single();

    // MOCK DATA: Generate deterministic 30-day time series
    const today = new Date();
    const series = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));

      // Generate slightly varied scores with downward trend
      const dayFactor = i / 30; // 0 to 1
      return {
        date: date.toISOString(),
        acne: Math.max(20, 65 - dayFactor * 20 + Math.sin(i * 0.5) * 5),
        dryness: Math.max(15, 45 - dayFactor * 15 + Math.cos(i * 0.3) * 8),
        pigmentation: Math.max(10, 35 - dayFactor * 10 + Math.sin(i * 0.7) * 6),
      };
    });

    const mockAnalysis: AnalysisSummary = {
      user_id: user.id,
      skin_type: 'oily',
      confidence: 0.87,
      primary_concern: 'acne',
      updatedAt: new Date().toISOString(),
      series,
      notes: [
        'Acne severity has decreased by 15% over the past 30 days',
        'Oiliness is most prominent in T-zone areas',
        'Consider increasing niacinamide concentration from 2% to 5%',
        'PIH (post-inflammatory hyperpigmentation) risk detected in affected areas',
      ],
      modelVersion: 'v2.1.3',
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('[API] /api/analysis/latest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
