import React from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IngredientBadge } from "./IngredientBadge";
import { cn } from "@/lib/utils";

interface RoutineCardProps {
  period: "AM" | "PM";
  step: number;
  productType: string;
  actives: string[];
  rationale: string;
  alternatives?: Array<{
    name: string;
    brand: string;
    price: number;
  }>;
  className?: string;
}

export function RoutineCard({
  period,
  step,
  productType,
  actives,
  rationale,
  alternatives,
  className,
}: RoutineCardProps) {
  return (
    <Card className={cn("p-6 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-medium">
            {step}
          </div>
          <div>
            <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              {period}
            </div>
            <h3 className="text-lg font-medium text-stone-900">{productType}</h3>
          </div>
        </div>
      </div>

      {/* Active ingredients */}
      <div className="flex flex-wrap gap-2">
        {actives.map((active) => (
          <IngredientBadge key={active} name={active} />
        ))}
      </div>

      {/* Rationale accordion */}
      <Accordion type="single" collapsible className="border-t border-stone-200">
        <AccordionItem value="rationale" className="border-none">
          <AccordionTrigger className="text-sm font-medium text-stone-700 hover:text-stone-900 py-3">
            Why this works
          </AccordionTrigger>
          <AccordionContent className="text-sm text-stone-600 leading-relaxed pb-3">
            {rationale}
          </AccordionContent>
        </AccordionItem>
        {alternatives && alternatives.length > 0 && (
          <AccordionItem value="alternatives" className="border-none border-t border-stone-200">
            <AccordionTrigger className="text-sm font-medium text-stone-700 hover:text-stone-900 py-3">
              Swap for...
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-3">
              {alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-stone-50"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      {alt.brand}
                    </p>
                    <p className="text-xs text-stone-600">{alt.name}</p>
                  </div>
                  <p className="text-sm font-medium text-stone-900">
                    ${alt.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </Card>
  );
}
