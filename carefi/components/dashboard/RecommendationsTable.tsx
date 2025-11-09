'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, Column } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/format';
import { useBudget } from '@/lib/budget-context';
import type { Recommendation } from '@/lib/types';

interface RecommendationsTableProps {
  skinConcerns: string[];
}

/**
 * Recommendations Table Component
 *
 * Displays filterable product recommendations
 */
export function RecommendationsTable({ skinConcerns }: RecommendationsTableProps) {
  const { min, max } = useBudget();
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    skinConcerns.slice(0, 2) // Default to first 2 concerns
  );
  const [cart, setCart] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery<Recommendation[]>({
    queryKey: ['recommendations', selectedConcerns, min, max],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedConcerns.length > 0) {
        params.set('concerns', selectedConcerns.join(','));
      }
      params.set('min', min.toString());
      params.set('max', max.toString());

      const response = await fetch(`/api/recommendations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  const addToCart = (productId: string) => {
    setCart((prev) => new Set(prev).add(productId));
    // In real app: update global cart state
  };

  const columns: Column<Recommendation>[] = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-neutral-900">{item.name}</p>
          <p className="text-xs text-neutral-500">{item.vendor}</p>
        </div>
      ),
    },
    {
      key: 'concern_tags',
      label: 'Concerns',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.concern_tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'key_ingredients',
      label: 'Key Ingredients',
      render: (item) => (
        <span className="text-sm text-neutral-700">
          {item.key_ingredients.slice(0, 2).join(', ')}
          {item.key_ingredients.length > 2 && ' +' + (item.key_ingredients.length - 2)}
        </span>
      ),
    },
    {
      key: 'price_usd',
      label: 'Price',
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-neutral-900">
            {formatCurrency(item.price_usd)}
          </p>
          {item.retail_usd > item.price_usd && (
            <p className="text-xs text-neutral-400 line-through">
              {formatCurrency(item.retail_usd)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'savings',
      label: 'Savings',
      sortable: true,
      sortFn: (a, b) => (b.retail_usd - b.price_usd) - (a.retail_usd - a.price_usd),
      render: (item) => {
        const savings = item.retail_usd - item.price_usd;
        const percent = Math.round((savings / item.retail_usd) * 100);
        return savings > 0 ? (
          <span className="text-sm font-medium text-emerald-600">
            {percent}%
          </span>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => addToCart(item.id)}
            disabled={cart.has(item.id)}
          >
            {cart.has(item.id) ? (
              'Added'
            ) : (
              <>
                <ShoppingCart className="mr-1 h-3 w-3" />
                Add
              </>
            )}
          </Button>
          {item.url && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(item.url, '_blank')}
              aria-label={`View ${item.name} on ${item.vendor}`}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {skinConcerns.map((concern) => (
            <Badge
              key={concern}
              variant={selectedConcerns.includes(concern) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleConcern(concern)}
            >
              {concern}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error || !data ? (
          <EmptyState
            title="Unable to load recommendations"
            description="Please try adjusting your filters"
          />
        ) : data.length === 0 ? (
          <EmptyState
            title="No products match your criteria"
            description="Try adjusting your budget range or selected concerns"
          />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            getRowKey={(item) => item.id}
          />
        )}
      </CardContent>
    </Card>
  );
}
