/**
 * Formatting utilities for dashboard displays
 */

import { formatDistanceToNowStrict, format } from 'date-fns';

/**
 * Format a number as USD currency
 * @example formatCurrency(49.99) => "$49.99"
 * @example formatCurrency(100) => "$100.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as a percentage
 * @example formatPercent(0.15) => "15%"
 * @example formatPercent(0.875) => "88%"
 * @example formatPercent(0.875, true) => "87.5%"
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a date as relative time
 * @example formatRelativeTime('2025-11-06T10:00:00Z') => "2 days ago"
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNowStrict(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Format a date as a short date string
 * @example formatShortDate('2025-11-08T10:00:00Z') => "Nov 8, 2025"
 */
export function formatShortDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Format a date for chart axes
 * @example formatChartDate('2025-11-08T10:00:00Z') => "Nov 8"
 */
export function formatChartDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d');
  } catch (error) {
    return '';
  }
}

/**
 * Format a confidence score
 * @example formatConfidence(0.87) => "87% confidence"
 */
export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}% confidence`;
}

/**
 * Calculate and format savings
 * @example calculateSavings(149.99, 99.99) => { amount: "$50.00", percent: "33%" }
 */
export function calculateSavings(
  retailPrice: number,
  actualPrice: number
): { amount: string; percent: string } {
  const savingsAmount = retailPrice - actualPrice;
  const savingsPercent = savingsAmount / retailPrice;

  return {
    amount: formatCurrency(savingsAmount),
    percent: formatPercent(savingsPercent),
  };
}

/**
 * Format a budget range
 * @example formatBudgetRange(50, 150) => "$50–$150"
 */
export function formatBudgetRange(min: number, max: number): string {
  return `${formatCurrency(min)}–${formatCurrency(max)}`;
}

/**
 * Format a large number with abbreviations
 * @example formatNumber(1500) => "1.5K"
 * @example formatNumber(1500000) => "1.5M"
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
