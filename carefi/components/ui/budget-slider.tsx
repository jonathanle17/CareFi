'use client';

import React from 'react';
import { Slider } from './slider';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface BudgetSliderProps {
  /** Current minimum value */
  min: number;
  /** Current maximum value */
  max: number;
  /** Absolute minimum allowed */
  absoluteMin: number;
  /** Absolute maximum allowed */
  absoluteMax: number;
  /** Callback when range changes */
  onChange: (min: number, max: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Budget Slider Component
 *
 * Dual-handle slider for selecting a budget range
 *
 * @example
 * ```tsx
 * <BudgetSlider
 *   min={50}
 *   max={150}
 *   absoluteMin={20}
 *   absoluteMax={300}
 *   onChange={(min, max) => console.log(`${min}-${max}`)}
 * />
 * ```
 */
export function BudgetSlider({
  min,
  max,
  absoluteMin,
  absoluteMax,
  onChange,
  className,
}: BudgetSliderProps) {
  const handleValueChange = (values: number[]) => {
    onChange(values[0], values[1]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-700">Min</p>
          <p className="text-xl font-semibold text-neutral-900">
            {formatCurrency(min)}
          </p>
        </div>
        <div className="h-px flex-1 mx-4 bg-neutral-200" />
        <div className="space-y-1 text-right">
          <p className="text-sm font-medium text-neutral-700">Max</p>
          <p className="text-xl font-semibold text-neutral-900">
            {formatCurrency(max)}
          </p>
        </div>
      </div>

      <Slider
        min={absoluteMin}
        max={absoluteMax}
        step={5}
        value={[min, max]}
        onValueChange={handleValueChange}
        className="w-full"
        aria-label="Budget range"
      />

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{formatCurrency(absoluteMin)}</span>
        <span>{formatCurrency(absoluteMax)}</span>
      </div>
    </div>
  );
}
