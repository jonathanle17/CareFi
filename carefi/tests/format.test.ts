import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatBudgetRange,
  formatConfidence,
  calculateSavings,
  formatNumber,
} from '../lib/format';

describe('formatCurrency', () => {
  it('formats whole numbers with two decimal places', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats decimal numbers correctly', () => {
    expect(formatCurrency(49.99)).toBe('$49.99');
    expect(formatCurrency(14.5)).toBe('$14.50');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});

describe('formatPercent', () => {
  it('formats decimal to percentage without decimals by default', () => {
    expect(formatPercent(0.15)).toBe('15%');
    expect(formatPercent(0.875)).toBe('88%');
  });

  it('respects decimal precision when specified', () => {
    expect(formatPercent(0.875, 1)).toBe('87.5%');
    expect(formatPercent(0.12345, 2)).toBe('12.35%');
  });

  it('handles zero and one', () => {
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('formatBudgetRange', () => {
  it('formats a budget range with currency', () => {
    expect(formatBudgetRange(50, 150)).toBe('$50.00–$150.00');
  });

  it('handles same min and max', () => {
    expect(formatBudgetRange(100, 100)).toBe('$100.00–$100.00');
  });
});

describe('formatConfidence', () => {
  it('formats confidence score as percentage', () => {
    expect(formatConfidence(0.87)).toBe('87% confidence');
    expect(formatConfidence(0.5)).toBe('50% confidence');
  });

  it('rounds to nearest integer', () => {
    expect(formatConfidence(0.876)).toBe('88% confidence');
    expect(formatConfidence(0.123)).toBe('12% confidence');
  });
});

describe('calculateSavings', () => {
  it('calculates savings amount and percent', () => {
    const result = calculateSavings(100, 75);
    expect(result.amount).toBe('$25.00');
    expect(result.percent).toBe('25%');
  });

  it('handles no savings (same price)', () => {
    const result = calculateSavings(100, 100);
    expect(result.amount).toBe('$0.00');
    expect(result.percent).toBe('0%');
  });

  it('calculates savings for realistic product prices', () => {
    const result = calculateSavings(189.99, 127.45);
    expect(result.amount).toBe('$62.54');
    expect(result.percent).toBe('33%');
  });
});

describe('formatNumber', () => {
  it('returns number as string if less than 1000', () => {
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(5000)).toBe('5.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(2000000)).toBe('2.0M');
  });
});
