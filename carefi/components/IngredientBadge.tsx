import React from "react";
import { Badge } from "@/components/ui/badge";

interface IngredientBadgeProps {
  name: string;
}

export function IngredientBadge({ name }: IngredientBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="rounded-full px-3 py-1 text-xs font-medium bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
    >
      {name}
    </Badge>
  );
}
