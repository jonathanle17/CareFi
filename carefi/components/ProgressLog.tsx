import React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgressItem } from "@/lib/types";

interface ProgressLogProps {
  items: ProgressItem[];
  className?: string;
}

export function ProgressLog({ items, className }: ProgressLogProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 text-sm transition-opacity duration-200"
        >
          {item.status === "done" ? (
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          ) : (
            <Loader2 className="flex-shrink-0 w-5 h-5 text-stone-400 animate-spin" />
          )}
          <span
            className={cn(
              "transition-colors",
              item.status === "done" ? "text-stone-700" : "text-stone-500"
            )}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
