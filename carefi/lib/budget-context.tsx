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
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);

  const setRange = (newMin: number, newMax: number) => {
    setMin(newMin);
    setMax(newMax);
  };

  return (
    <BudgetContext.Provider
      value={{
        min,
        max,
        absoluteMin: initialMin,
        absoluteMax: initialMax,
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
