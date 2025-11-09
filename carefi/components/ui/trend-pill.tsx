import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendPillProps {
  /** Trend direction: 'up', 'down', or 'neutral' */
  direction: 'up' | 'down' | 'neutral';
  /** Value to display (e.g., "5%", "+12") */
  value: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Trend Pill Component
 *
 * Displays a trend indicator with icon and value
 *
 * @example
 * ```tsx
 * <TrendPill direction="up" value="+5%" />
 * <TrendPill direction="down" value="-3%" />
 * <TrendPill direction="neutral" value="No change" />
 * ```
 */
export function TrendPill({ direction, value, className }: TrendPillProps) {
  const Icon =
    direction === 'up'
      ? TrendingUp
      : direction === 'down'
        ? TrendingDown
        : Minus;

  const colorClasses = {
    up: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    down: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-neutral-50 text-neutral-600 border-neutral-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClasses[direction],
        className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{value}</span>
    </span>
  );
}
