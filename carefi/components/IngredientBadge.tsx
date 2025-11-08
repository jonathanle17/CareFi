import React from "react";
import { Badge } from "@/components/ui/badge";

interface IngredientBadgeProps {
  name: string;
}

export function IngredientBadge({ name }: IngredientBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="rounded-full px-3 py-1 text-xs font-medium bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
    >
      {name}
    </Badge>
  );
}
