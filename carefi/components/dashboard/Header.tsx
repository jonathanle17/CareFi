import React from 'react';
import Link from 'next/link';
import { Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  displayName: string | null;
}

/**
 * Dashboard Header
 *
 * Displays greeting and quick action buttons
 */
export function Header({ displayName }: HeaderProps) {
  const greeting = displayName ? `Hi, ${displayName}` : 'Welcome back';

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">{greeting}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Here's your latest skin insights
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload photos
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings/routine">
            <Settings className="mr-2 h-4 w-4" />
            Update routine
          </Link>
        </Button>
      </div>
    </div>
  );
}
