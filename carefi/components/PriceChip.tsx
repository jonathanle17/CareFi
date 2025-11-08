import React from "react";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceChipProps {
  deltaPct: number;
  className?: string;
}

export function PriceChip({ deltaPct, className }: PriceChipProps) {
  const isPositive = deltaPct < 0; // Negative delta means savings

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
        isPositive
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-rose-50 text-rose-700 border border-rose-200",
        className
      )}
    >
      {isPositive && <TrendingDown className="w-4 h-4" />}
      <span>{Math.abs(deltaPct)}% {isPositive ? "savings" : "more"}</span>
    </div>
  );
}
