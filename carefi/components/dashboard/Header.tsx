import React from 'react';

interface HeaderProps {
  displayName: string | null;
}

/**
 * Dashboard Header
 *
 * Displays greeting
 */
export function Header({ displayName }: HeaderProps) {
  const greeting = displayName ? `Hi, ${displayName}` : 'Welcome back';

  return (
    <div>
      <h1 className="text-3xl font-semibold text-neutral-900">{greeting}</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Here's your latest skin insights
      </p>
    </div>
  );
}
