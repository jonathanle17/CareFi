'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './input';
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
 * Budget Input Component
 *
 * Text inputs for selecting a budget range
 *
 * @example
 * ```tsx
 * <BudgetSlider
 *   min={50}
 *   max={150}
 *   absoluteMin={1}
 *   absoluteMax={Infinity}
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
  const [minInputValue, setMinInputValue] = useState(min.toString());
  const [maxInputValue, setMaxInputValue] = useState(max.toString());
  const [minError, setMinError] = useState<string | null>(null);
  const [maxError, setMaxError] = useState<string | null>(null);

  // Sync input values when min/max change externally
  useEffect(() => {
    setMinInputValue(min.toString());
  }, [min]);

  useEffect(() => {
    setMaxInputValue(max.toString());
  }, [max]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input while typing
    if (value === '') {
      setMinInputValue('');
      setMinError(null);
      return;
    }

    // Only allow numbers
    if (!/^\d*\.?\d*$/.test(value)) {
      setMinError('Please enter only numbers');
      return;
    }

    setMinInputValue(value);
    setMinError(null);

    const numValue = parseFloat(value);
    
    // Validate range
    if (isNaN(numValue)) {
      return;
    }

    if (numValue < 1) {
      setMinError('Minimum value must be at least $1');
      return;
    }

    // Clear error and update value if valid
    setMinError(null);
    // Ensure min doesn't exceed max
    const validMin = Math.min(numValue, max);
    onChange(validMin, max);
  };

  const handleMinInputBlur = () => {
    const numValue = parseFloat(minInputValue);
    
    // If empty or invalid, reset to current min
    if (isNaN(numValue) || minInputValue === '') {
      setMinInputValue(min.toString());
      setMinError(null);
      return;
    }

    // Validate and apply constraints
    if (numValue < 1) {
      setMinError('Minimum value must be at least $1');
      setMinInputValue('1');
      onChange(1, max);
      return;
    }

    // Ensure min doesn't exceed max
    const validMin = Math.min(numValue, max);
    setMinInputValue(validMin.toString());
    setMinError(null);
    onChange(validMin, max);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input while typing
    if (value === '') {
      setMaxInputValue('');
      setMaxError(null);
      return;
    }

    // Only allow numbers
    if (!/^\d*\.?\d*$/.test(value)) {
      setMaxError('Please enter only numbers');
      return;
    }

    setMaxInputValue(value);

    const numValue = parseFloat(value);
    
    // Validate range
    if (isNaN(numValue)) {
      setMaxError(null);
      return;
    }

    if (numValue > 100000000) {
      setMaxError('Maximum value cannot exceed $100,000,000');
      return;
    }

    // Clear error and update value if valid
    setMaxError(null);
    // Ensure max is at least min
    const validMax = Math.max(min, numValue);
    onChange(min, validMax);
  };

  const handleMaxInputBlur = () => {
    const numValue = parseFloat(maxInputValue);
    
    // If empty or invalid, reset to current max
    if (isNaN(numValue) || maxInputValue === '') {
      setMaxInputValue(max.toString());
      setMaxError(null);
      return;
    }

    // Validate and apply constraints
    if (numValue > 100000000) {
      setMaxError('Maximum value cannot exceed $100,000,000');
      setMaxInputValue('100000000');
      onChange(min, 100000000);
      return;
    }

    // Ensure max is at least min
    const validMax = Math.max(min, numValue);
    setMaxInputValue(validMax.toString());
    setMaxError(null);
    onChange(min, validMax);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <p className="text-sm font-medium text-neutral-700">Min</p>
          <div className="flex flex-col gap-1">
            <Input
              type="text"
              inputMode="numeric"
              value={minInputValue}
              onChange={handleMinInputChange}
              onBlur={handleMinInputBlur}
              className="text-xl font-semibold text-neutral-900 h-auto py-1"
              placeholder={min.toString()}
            />
            {minError && (
              <p className="text-xs text-red-600">{minError}</p>
            )}
          </div>
        </div>
        <div className="h-px flex-1 mx-4 bg-neutral-200" />
        <div className="space-y-1 text-right flex-1">
          <p className="text-sm font-medium text-neutral-700">Max</p>
          <div className="flex flex-col items-end gap-1">
            <Input
              type="text"
              inputMode="numeric"
              value={maxInputValue}
              onChange={handleMaxInputChange}
              onBlur={handleMaxInputBlur}
              className="text-xl font-semibold text-neutral-900 h-auto py-1 text-right w-full"
              placeholder={max.toString()}
            />
            {maxError && (
              <p className="text-xs text-red-600 text-right">{maxError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
