import React from 'react';
import { Droplet, Target, DollarSign, Clock } from 'lucide-react';
import { KPIStat } from '@/components/ui/kpi-stat';
import { formatBudgetRange, formatRelativeTime, formatConfidence } from '@/lib/format';
import type { OnboardingRow } from '@/lib/types';

interface KPIRowProps {
  onboardingData: OnboardingRow;
  skinType?: string;
  confidence?: number;
  lastAnalysisDate?: string;
}

/**
 * KPI Row Component
 *
 * Displays 4 key metrics in a grid
 */
export function KPIRow({
  onboardingData,
  skinType,
  confidence,
  lastAnalysisDate,
}: KPIRowProps) {
  const primaryConcern =
    onboardingData.skin_concerns[0] || 'Not specified';
  const budgetRange = formatBudgetRange(
    onboardingData.budget_min_usd,
    onboardingData.budget_max_usd
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPIStat
        label="Skin Type"
        value={skinType ? skinType.charAt(0).toUpperCase() + skinType.slice(1) : 'Analyzing...'}
        subtitle={confidence ? formatConfidence(confidence) : undefined}
        icon={Droplet}
      />

      <KPIStat
        label="Primary Concern"
        value={primaryConcern.charAt(0).toUpperCase() + primaryConcern.slice(1)}
        subtitle="From your onboarding"
        icon={Target}
      />

      <KPIStat
        label="Budget Window"
        value={budgetRange}
        subtitle="Your personalized range"
        icon={DollarSign}
      />

      <KPIStat
        label="Last Analysis"
        value={lastAnalysisDate ? formatRelativeTime(lastAnalysisDate) : 'No data'}
        subtitle="Upload photos for updates"
        icon={Clock}
      />
    </div>
  );
}
