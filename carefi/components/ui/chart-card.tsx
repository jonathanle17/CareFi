import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface ChartCardProps {
  /** Chart title */
  title: string;
  /** Optional description */
  description?: string;
  /** Chart content (Recharts component) */
  children: React.ReactNode;
  /** Optional right-side content (e.g., metadata, legend) */
  aside?: React.ReactNode;
}

/**
 * Chart Card Component
 *
 * Wrapper for Recharts visualizations with consistent styling
 *
 * @example
 * ```tsx
 * <ChartCard
 *   title="Skin Analysis Trends"
 *   description="Last 30 days"
 *   aside={<div>Model: v2.1.3</div>}
 * >
 *   <ResponsiveContainer width="100%" height={300}>
 *     <LineChart data={data}>...</LineChart>
 *   </ResponsiveContainer>
 * </ChartCard>
 * ```
 */
export function ChartCard({
  title,
  description,
  children,
  aside,
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {aside && <div className="text-sm text-neutral-600">{aside}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
