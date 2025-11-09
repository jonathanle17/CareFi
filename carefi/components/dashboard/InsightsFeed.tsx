'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lightbulb, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelativeTime } from '@/lib/format';
import type { AnalysisSummary } from '@/lib/types';

interface Insight {
  id: string;
  type: 'success' | 'info' | 'warning' | 'tip';
  message: string;
  timestamp: string;
}

/**
 * Insights Feed Component
 *
 * Displays AI-generated insights and alerts from latest analysis
 */
export function InsightsFeed() {
  const { data, isLoading, error } = useQuery<AnalysisSummary>({
    queryKey: ['analysis', 'latest'],
    queryFn: async () => {
      const response = await fetch('/api/analysis/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={AlertCircle}
            title="Unable to load insights"
            description="Please try refreshing the page"
          />
        </CardContent>
      </Card>
    );
  }

  const insights = data.notes;
  const updatedAt = data.updatedAt;
  // Transform string insights into structured format
  const structuredInsights: Insight[] = insights.map((message, index) => {
    let type: Insight['type'] = 'info';

    if (message.toLowerCase().includes('decreased') || message.toLowerCase().includes('improved')) {
      type = 'success';
    } else if (message.toLowerCase().includes('risk') || message.toLowerCase().includes('detected')) {
      type = 'warning';
    } else if (message.toLowerCase().includes('consider')) {
      type = 'tip';
    }

    return {
      id: `insight-${index}`,
      type,
      message,
      timestamp: updatedAt || new Date().toISOString(),
    };
  });

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      default:
        return <TrendingDown className="h-5 w-5 text-neutral-600" />;
    }
  };

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'tip':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" role="feed" aria-live="polite">
          {structuredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`flex gap-3 rounded-lg border p-3 ${getBgColor(insight.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-neutral-900">{insight.message}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {formatRelativeTime(insight.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
