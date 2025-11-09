'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from '@/components/ui/chart-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { TrendingDown } from 'lucide-react';
import { formatChartDate } from '@/lib/format';
import type { AnalysisSummary } from '@/lib/types';

/**
 * Analysis Overview Component
 *
 * Displays time-series chart of skin analysis scores
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

  const chartData = data.series.map((point) => ({
    date: formatChartDate(point.date),
    acne: Math.round(point.acne),
    dryness: Math.round(point.dryness),
    pigmentation: Math.round(point.pigmentation),
  }));

  const aside = (
    <div className="text-right space-y-1">
      <p className="text-xs text-neutral-500">Model: {data.modelVersion}</p>
      <p className="text-xs text-neutral-500">
        Updated: {new Date(data.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );

  return (
    <ChartCard
      title="Analysis Overview"
      description="Skin concern trends over the past 30 days"
      aside={aside}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="date"
            stroke="#737373"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#737373"
            fontSize={12}
            tickLine={false}
            domain={[0, 100]}
            label={{ value: 'Severity', angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <Line
            type="monotone"
            dataKey="acne"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="Acne"
            aria-label="Acne severity over time"
          />
          <Line
            type="monotone"
            dataKey="dryness"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Dryness"
            aria-label="Dryness severity over time"
          />
          <Line
            type="monotone"
            dataKey="pigmentation"
            stroke="#a855f7"
            strokeWidth={2}
            dot={false}
            name="Pigmentation"
            aria-label="Pigmentation severity over time"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Offscreen table for accessibility */}
      <div className="sr-only" role="table" aria-label="Analysis data table">
        <div role="rowgroup">
          <div role="row">
            <div role="columnheader">Date</div>
            <div role="columnheader">Acne</div>
            <div role="columnheader">Dryness</div>
            <div role="columnheader">Pigmentation</div>
          </div>
        </div>
        <div role="rowgroup">
          {data.series.slice(-7).map((point, i) => (
            <div key={i} role="row">
              <div role="cell">{formatChartDate(point.date)}</div>
              <div role="cell">{Math.round(point.acne)}</div>
              <div role="cell">{Math.round(point.dryness)}</div>
              <div role="cell">{Math.round(point.pigmentation)}</div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
