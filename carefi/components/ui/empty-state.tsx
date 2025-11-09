import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Heading text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Empty State Component
 *
 * Displays when no data is available for a section
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={FileQuestion}
 *   title="No analysis yet"
 *   description="Upload your photos to get started"
 *   action={<Button>Upload Photos</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <Icon className="h-8 w-8 text-neutral-400" aria-hidden="true" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-neutral-600">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
