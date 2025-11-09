import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AllergyListProps {
  ingredientsToAvoid: string | null;
}

/**
 * Allergy List Component
 *
 * Displays user's ingredients to avoid with warning badges
 */
export function AllergyList({ ingredientsToAvoid }: AllergyListProps) {
  if (!ingredientsToAvoid || ingredientsToAvoid.trim() === '') {
    return null;
  }

  // Parse comma-separated string into array
  const ingredients = ingredientsToAvoid
    .split(',')
    .map((ing) => ing.trim())
    .filter(Boolean);

  if (ingredients.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle>Ingredients to Avoid</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-neutral-600">
          Products containing these ingredients are filtered from recommendations:
        </p>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <Badge
              key={ingredient}
              variant="destructive"
              className="font-normal"
            >
              {ingredient}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
