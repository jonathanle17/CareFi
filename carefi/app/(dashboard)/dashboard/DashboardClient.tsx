'use client';

import React from 'react';
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
import type { OnboardingRow } from '@/lib/types';

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
            <KPIRow onboardingData={onboardingData} />

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Analysis Chart */}
              <div className="lg:col-span-2">
                <AnalysisOverview />
              </div>

              {/* Routine Planner */}
              <RoutinePlanner />

              {/* Budget Optimizer */}
              <BudgetOptimizer />

              {/* Recommendations Table */}
              <div className="lg:col-span-2">
                <RecommendationsTable skinConcerns={onboardingData.skin_concerns} />
              </div>

              {/* Insights Feed */}
              <div className="lg:col-span-1">
                <InsightsFeed />
              </div>

              {/* Allergy List */}
              <div className="lg:col-span-1">
                <AllergyList ingredientsToAvoid={onboardingData.ingredients_to_avoid} />
              </div>
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
