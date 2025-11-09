'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BudgetProvider } from '@/lib/budget-context';
import { Header } from '@/components/dashboard/Header';
import { KPIRow } from '@/components/dashboard/KPIRow';
import { AnalysisOverview } from '@/components/dashboard/AnalysisOverview';
import { RoutinePlanner } from '@/components/dashboard/RoutinePlanner';
import { BudgetOptimizer } from '@/components/dashboard/BudgetOptimizer';
import { RecommendationsTable } from '@/components/dashboard/RecommendationsTable';
import { InsightsFeed } from '@/components/dashboard/InsightsFeed';
import { AllergyList } from '@/components/dashboard/AllergyList';
import type { OnboardingRow, AnalysisSummary } from '@/lib/types';

interface DashboardClientProps {
  onboardingData: OnboardingRow;
  displayName: string | null;
}

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Dashboard Client Component
 *
 * Client-side dashboard with React Query provider
 */
export function DashboardClient({
  onboardingData,
  displayName,
}: DashboardClientProps) {
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisSummary | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);

  // Fetch the latest analysis on mount
  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        const response = await fetch('/api/analysis/latest');
        if (response.ok) {
          const data = await response.json();
          // API returns { success: true, data: null } when no analysis exists
          // or the AnalysisSummary directly
          if (data.success === true && data.data === null) {
            setLatestAnalysis(null);
          } else if (data.user_id) {
            // AnalysisSummary format
            setLatestAnalysis(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch latest analysis:', error);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchLatestAnalysis();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BudgetProvider
        initialMin={onboardingData.budget_min_usd}
        initialMax={onboardingData.budget_max_usd}
      >
        <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Header */}
            <Header displayName={displayName} />

            {/* KPI Row */}
            <KPIRow 
              onboardingData={onboardingData}
              skinType={latestAnalysis?.skin_type}
              confidence={latestAnalysis?.confidence}
              lastAnalysisDate={latestAnalysis?.updatedAt}
            />

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Analysis Chart */}

              <div className="lg:col-span-2">
                <AnalysisOverview />
              </div>

              {/* Recommendations Table */}
              <div className="lg:col-span-2">
                <RecommendationsTable skinConcerns={onboardingData.skin_concerns} />
              </div>

              {/* Routine Planner */}
              <RoutinePlanner />

              {/* Budget Optimizer */}
              <BudgetOptimizer />
            </div>

            {/* Footer */}
            <footer className="mt-12 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
              <p>
                Analysis results are AI-generated and for informational purposes only.
                Consult a dermatologist for medical advice.
              </p>
              <p className="mt-2">
                <a href="/feedback" className="underline hover:text-neutral-700">
                  Share feedback
                </a>
              </p>
            </footer>
          </div>
        </div>
      </BudgetProvider>
    </QueryClientProvider>
  );
}
