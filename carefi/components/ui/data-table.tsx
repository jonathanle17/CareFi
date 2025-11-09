'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  /** Column key (must match data property) */
  key: keyof T | string;
  /** Column header label */
  label: string;
  /** Optional custom cell renderer */
  render?: (item: T) => React.ReactNode;
  /** Is this column sortable? */
  sortable?: boolean;
  /** Custom sort function */
  sortFn?: (a: T, b: T) => number;
  /** Optional className for cells in this column */
  className?: string;
}

interface DataTableProps<T> {
  /** Data to display */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Optional row key extractor (defaults to index) */
  getRowKey?: (item: T, index: number) => string;
  /** Optional empty state */
  emptyState?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Data Table Component
 *
 * Sortable, filterable table with custom cell renderers
 *
 * @example
 * ```tsx
 * const columns: Column<Product>[] = [
 *   { key: 'name', label: 'Product', sortable: true },
 *   { key: 'price', label: 'Price', render: (p) => formatCurrency(p.price) },
 * ];
 *
 * <DataTable data={products} columns={columns} />
 * ```
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  getRowKey = (_, index) => index.toString(),
  emptyState,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const key = column.key as string;
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    const column = columns.find((col) => col.key === sortKey);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let result = 0;

      if (column.sortFn) {
        result = column.sortFn(a, b);
      } else {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          result = aVal - bVal;
        } else {
          result = String(aVal).localeCompare(String(bVal));
        }
      }

      return sortDirection === 'asc' ? result : -result;
    });
  }, [data, sortKey, sortDirection, columns]);

  if (data.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((column) => (
              <th
                key={column.key as string}
                className={cn(
                  'px-4 py-3 text-left text-sm font-medium text-neutral-700',
                  column.sortable && 'cursor-pointer select-none hover:bg-neutral-100',
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && sortKey === column.key && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key as string}
                  className={cn('px-4 py-3 text-sm text-neutral-900', column.className)}
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
