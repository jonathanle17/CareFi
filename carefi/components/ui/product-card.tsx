import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  /** Product name */
  name: string;
  /** Concern tags */
  concerns: string[];
  /** Key ingredients */
  ingredients: string[];
  /** Current price */
  price: number;
  /** Retail price (for savings calculation) */
  retailPrice?: number;
  /** Vendor name */
  vendor: string;
  /** Product URL */
  url?: string;
  /** Add to cart callback */
  onAdd?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Product Card Component
 *
 * Displays a recommended product with key info and actions
 *
 * @example
 * ```tsx
 * <ProductCard
 *   name="CeraVe Hydrating Cleanser"
 *   concerns={["Dryness", "Sensitive"]}
 *   ingredients={["Ceramides", "Hyaluronic Acid"]}
 *   price={14.99}
 *   retailPrice={19.99}
 *   vendor="Amazon"
 *   url="https://..."
 *   onAdd={() => console.log('Added to cart')}
 * />
 * ```
 */
export function ProductCard({
  name,
  concerns,
  ingredients,
  price,
  retailPrice,
  vendor,
  url,
  onAdd,
  className,
}: ProductCardProps) {
  const hasSavings = retailPrice && retailPrice > price;
  const savingsPercent = hasSavings
    ? Math.round(((retailPrice - price) / retailPrice) * 100)
    : 0;

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border border-neutral-200 p-4 transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex-1 space-y-2">
        <div>
          <h4 className="font-medium text-neutral-900">{name}</h4>
          <p className="text-xs text-neutral-500">{vendor}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {concerns.map((concern) => (
            <Badge key={concern} variant="secondary" className="text-xs">
              {concern}
            </Badge>
          ))}
        </div>

        <p className="text-xs text-neutral-600">
          {ingredients.slice(0, 3).join(', ')}
          {ingredients.length > 3 && ` +${ingredients.length - 3} more`}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-neutral-900">
            {formatCurrency(price)}
          </span>
          {hasSavings && (
            <>
              <span className="text-sm text-neutral-400 line-through">
                {formatCurrency(retailPrice)}
              </span>
              <span className="text-xs font-medium text-emerald-600">
                Save {savingsPercent}%
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {onAdd && (
          <Button size="sm" onClick={onAdd}>
            Add
          </Button>
        )}
        {url && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
