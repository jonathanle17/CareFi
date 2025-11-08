import React from "react";
import { Check, X } from "lucide-react";
import { PriceChip } from "./PriceChip";
import { IngredientBadge } from "./IngredientBadge";
import type { Product } from "@/lib/types";

interface CompareRowProps {
  step: string;
  brand: Product;
  dupes: Product[];
}

export function CompareRow({ step, brand, dupes }: CompareRowProps) {
  const bestDupe = dupes[0];
  const savings = brand.price - bestDupe.price;
  const savingsPercent = Math.round((savings / brand.price) * 100);

  const activeMatch = bestDupe.actives.some((active) =>
    brand.actives.includes(active)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-6 rounded-xl border border-stone-200 bg-white hover:shadow-md transition-shadow duration-200">
      {/* Step name */}
      <div className="lg:col-span-2">
        <p className="text-sm font-medium text-stone-900">{step}</p>
      </div>

      {/* Brand pick */}
      <div className="lg:col-span-3 space-y-2">
        <div>
          <p className="text-sm font-medium text-stone-900">{brand.brand}</p>
          <p className="text-xs text-stone-600">{brand.name}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {brand.actives.slice(0, 2).map((active) => (
            <IngredientBadge key={active} name={active} />
          ))}
          {brand.actives.length > 2 && (
            <span className="text-xs text-stone-500">
              +{brand.actives.length - 2}
            </span>
          )}
        </div>
        <p className="text-base font-semibold text-stone-900">
          ${brand.price.toFixed(2)}
        </p>
      </div>

      {/* Best dupe */}
      <div className="lg:col-span-3 space-y-2 lg:pl-6 lg:border-l border-stone-200">
        <div>
          <p className="text-sm font-medium text-stone-900">{bestDupe.brand}</p>
          <p className="text-xs text-stone-600">{bestDupe.name}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {bestDupe.actives.slice(0, 2).map((active) => (
            <IngredientBadge key={active} name={active} />
          ))}
          {bestDupe.actives.length > 2 && (
            <span className="text-xs text-stone-500">
              +{bestDupe.actives.length - 2}
            </span>
          )}
        </div>
        <p className="text-base font-semibold text-emerald-700">
          ${bestDupe.price.toFixed(2)}
        </p>
      </div>

      {/* Match indicator */}
      <div className="lg:col-span-2 flex items-start lg:justify-center">
        <div className="flex items-center gap-2">
          {activeMatch ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-stone-600">Match</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-500">Similar</span>
            </>
          )}
        </div>
      </div>

      {/* Savings */}
      <div className="lg:col-span-2 flex items-start lg:justify-end">
        <PriceChip deltaPct={-savingsPercent} />
      </div>
    </div>
  );
}
