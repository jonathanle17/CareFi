'use client';

/**
 * Budget Context
 *
 * Provides shared state for budget range selection across dashboard components.
 * The budget slider and recommendations table sync through this context.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BudgetContextValue {
  /** Current minimum budget value */
  min: number;
  /** Current maximum budget value */
  max: number;
  /** Absolute minimum allowed (from onboarding) */
  absoluteMin: number;
  /** Absolute maximum allowed (from onboarding) */
  absoluteMax: number;
  /** Update budget range */
  setRange: (min: number, max: number) => void;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

interface BudgetProviderProps {
  children: ReactNode;
  /** Initial minimum from onboarding_data.budget_min_usd */
  initialMin: number;
  /** Initial maximum from onboarding_data.budget_max_usd */
  initialMax: number;
}

/**
 * Budget Context Provider
 *
 * Wrap dashboard sections that need budget state
 *
 * @example
 * ```tsx
 * <BudgetProvider initialMin={50} initialMax={150}>
 *   <BudgetOptimizer />
 *   <RecommendationsTable />
 * </BudgetProvider>
 * ```
 */
export function BudgetProvider({
  children,
  initialMin,
  initialMax,
}: BudgetProviderProps) {
  // Ensure min is at least $1, but preserve the user's initial preference if it's higher
  const initialMinValue = Math.max(1, initialMin);
  const [min, setMin] = useState(initialMinValue);
  // Ensure max is at least min, but cannot exceed 100 million
  const [max, setMax] = useState(Math.max(initialMinValue, Math.min(100000000, initialMax)));

  const setRange = (newMin: number, newMax: number) => {
    // Ensure min never goes below $1 and doesn't exceed max
    const validMin = Math.max(1, Math.min(newMin, newMax));
    // Ensure max is at least min, but cannot exceed 100 million
    const validMax = Math.max(validMin, Math.min(100000000, newMax));
    setMin(validMin);
    setMax(validMax);
  };

  return (
    <BudgetContext.Provider
      value={{
        min,
        max,
        absoluteMin: 1, // Always allow minimum of $1
        absoluteMax: 100000000, // Maximum cannot exceed $100,000,000
        setRange,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

/**
 * Hook to access budget context
 *
 * @throws {Error} If used outside BudgetProvider
 *
 * @example
 * ```tsx
 * function BudgetSlider() {
 *   const { min, max, setRange } = useBudget();
 *   return <input value={min} onChange={(e) => setRange(+e.target.value, max)} />;
 * }
 * ```
 */
export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
