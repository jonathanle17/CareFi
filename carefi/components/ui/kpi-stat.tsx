import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

interface KPIStatProps {
  /** Label for the metric */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Optional icon */
  icon?: LucideIcon;
  /** Optional subtitle/helper text */
  subtitle?: string;
  /** Optional trend indicator */
  trend?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * KPI Stat Component
 *
 * Displays a single key performance indicator in a card
 *
 * @example
 * ```tsx
 * <KPIstat
 *   label="Skin Type"
 *   value="Oily"
 *   icon={Droplet}
 *   subtitle="87% confidence"
 * />
 * ```
 */
export function KPIStat({
  label,
  value,
  icon: Icon,
  subtitle,
  trend,
  className,
}: KPIStatProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
            )}
            {trend && <div className="mt-2">{trend}</div>}
          </div>
          {Icon && (
            <div className="ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-50">
              <Icon className="h-5 w-5 text-neutral-600" aria-hidden="true" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
