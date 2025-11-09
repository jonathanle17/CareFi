'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartCard } from '@/components/ui/chart-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { TrendingDown, Droplet, Flame, AlertCircle, Sun, Clock, Circle } from 'lucide-react';
import type { AnalysisSummary, SkinTrait } from '@/lib/types';

/**
 * Analysis Overview Component
 *
 * Displays detected skin traits with visual severity indicators
 */
export function AnalysisOverview() {
  const { data, isLoading, error } = useQuery<AnalysisSummary>({
    queryKey: ['analysis', 'latest'],
    queryFn: async () => {
      const response = await fetch('/api/analysis/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  if (isLoading) {
    return (
      <ChartCard title="Analysis Overview" description="Loading...">
        <Skeleton className="h-[300px] w-full" />
      </ChartCard>
    );
  }

  if (error || !data) {
    return (
      <ChartCard title="Analysis Overview">
        <EmptyState
          icon={TrendingDown}
          title="Unable to load analysis"
          description="Please try refreshing the page"
        />
      </ChartCard>
    );
  }

  const traits = data.detected_traits || [];

  const aside = (
    <div className="text-right space-y-1">
      <p className="text-xs text-neutral-500">
        Updated: {new Date(data.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );

  // Map trait IDs to icons and colors
  const getTraitIcon = (traitId: string) => {
    const iconMap: Record<string, React.ElementType> = {
      acne: AlertCircle,
      dryness: Droplet,
      oiliness: Flame,
      sensitivity: AlertCircle,
      hyperpigmentation: Sun,
      'fine-lines': Clock,
      redness: Flame,
      'large-pores': Circle,
    };
    return iconMap[traitId] || Circle;
  };

  const getSeverityStyles = (severity: 'low' | 'moderate' | 'high') => {
    const styles = {
      low: {
        bg: 'bg-stone-50',
        border: 'border-stone-200',
        text: 'text-stone-700',
        badge: 'bg-stone-100 text-stone-700',
        bar: 'bg-emerald-400',
        width: 'w-1/3',
      },
      moderate: {
        bg: 'bg-stone-50',
        border: 'border-stone-200',
        text: 'text-stone-700',
        badge: 'bg-stone-100 text-stone-700',
        bar: 'bg-yellow-400',
        width: 'w-2/3',
      },
      high: {
        bg: 'bg-stone-50',
        border: 'border-rose-200',
        text: 'text-stone-700',
        badge: 'bg-stone-100 text-stone-700',
        bar: 'bg-red-400',
        width: 'w-full',
      },
    };
    return styles[severity];
  };

  if (traits.length === 0) {
    return (
      <ChartCard title="Analysis Overview" aside={aside}>
        <EmptyState
          icon={TrendingDown}
          title="No traits detected"
          description="Complete an analysis to see your skin traits"
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Detected Skin Traits"
      description={`${traits.length} trait${traits.length !== 1 ? 's' : ''} identified in your analysis`}
      aside={aside}
    >
      <div className="space-y-4">
        {traits.map((trait) => {
          const Icon = getTraitIcon(trait.id);
          const styles = getSeverityStyles(trait.severity);

          return (
            <div
              key={trait.id}
              className={`rounded-lg border ${styles.border} ${styles.bg} p-4 transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Icon className={`w-5 h-5 ${styles.text}`} />
                  <h4 className={`font-semibold ${styles.text}`}>{trait.name}</h4>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${styles.badge} uppercase tracking-wide`}
                >
                  {trait.severity}
                </span>
              </div>

              {/* Severity bar */}
              <div className="mb-2 h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${styles.bar} transition-all duration-500 rounded-full`}
                  style={{ width: styles.width.replace('w-', '').replace('1/3', '33%').replace('2/3', '66%').replace('full', '100%') }}
                />
              </div>

              <p className="text-sm text-neutral-600">{trait.description}</p>
            </div>
          );
        })}
      </div>

      {/* Severity legend */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <div className="flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-neutral-600">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-neutral-600">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="text-neutral-600">High</span>
          </div>
        </div>
      </div>

      {/* Offscreen table for accessibility */}
      <div className="sr-only" role="table" aria-label="Detected traits table">
        <div role="rowgroup">
          <div role="row">
            <div role="columnheader">Trait</div>
            <div role="columnheader">Severity</div>
            <div role="columnheader">Description</div>
          </div>
        </div>
        <div role="rowgroup">
          {traits.map((trait, i) => (
            <div key={i} role="row">
              <div role="cell">{trait.name}</div>
              <div role="cell">{trait.severity}</div>
              <div role="cell">{trait.description}</div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
