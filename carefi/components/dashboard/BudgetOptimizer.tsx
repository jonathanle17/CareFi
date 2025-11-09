'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetSlider } from '@/components/ui/budget-slider';
import { formatCurrency } from '@/lib/format';
import { useBudget } from '@/lib/budget-context';

/**
 * Budget Optimizer Component
 *
 * Allows users to adjust budget range and see savings summary
 */
export function BudgetOptimizer() {
  const { min, max, absoluteMin, absoluteMax, setRange } = useBudget();

  // Mock cart data - in real app, calculate from selected products
  const currentTotal = 127.45;
  const retailTotal = 189.99;
  const savings = retailTotal - currentTotal;
  const savingsPercent = Math.round((savings / retailTotal) * 100);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Budget Optimizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col">
        <div className="space-y-6 flex-1">
          <BudgetSlider
            min={min}
            max={max}
            absoluteMin={absoluteMin}
            absoluteMax={absoluteMax}
            onChange={setRange}
          />

          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-20">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 mt-5">
                <p className="text-sm font-medium text-emerald-900">
                  You're saving {savingsPercent}%
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Your current picks total{' '}
                  <span className="font-semibold">{formatCurrency(currentTotal)}</span>{' '}
                  vs{' '}
                  <span className="line-through">{formatCurrency(retailTotal)}</span>{' '}
                  retail
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href="/checkout">View cart simulation</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
