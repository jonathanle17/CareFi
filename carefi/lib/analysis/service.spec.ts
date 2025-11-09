/**
 * Unit tests for analysis service
 *
 * Tests the mapVisionToSummary function that transforms OpenAI responses
 * into the dashboard-ready AnalysisSummary format
 */

import { describe, it, expect } from 'vitest';
import { mapVisionToSummary } from './service';
import type { VisionAnalysis } from '@/lib/ai/openai';

describe('mapVisionToSummary', () => {
  const userId = 'test-user-123';
  const completedAt = '2025-11-08T12:00:00Z';

  it('should map Oily skin type correctly', () => {
    const visionResult: VisionAnalysis = {
      skinType: 'Oily',
      confidence: 85,
      primaryConcern: 'Excess oil production',
      traits: [
        {
          id: 'oiliness',
          name: 'Oiliness',
          severity: 'high',
          description: 'Significant sebum production',
        },
      ],
      notes: ['Use oil-free products'],
      modelVersion: 'gpt-4o-mini',
    };

    const summary = mapVisionToSummary(userId, visionResult, completedAt);

    expect(summary.user_id).toBe(userId);
    expect(summary.skin_type).toBe('oily');
    expect(summary.confidence).toBe(0.85); // Converted from 0-100 to 0-1
    expect(summary.primary_concern).toBe('Excess oil production');
    expect(summary.updatedAt).toBe(completedAt);
    expect(summary.modelVersion).toBe('gpt-4o-mini');
  });

  it('should map Dry skin type correctly', () => {
    const visionResult: VisionAnalysis = {
      skinType: 'Dry',
      confidence: 92,
      primaryConcern: 'Dehydration',
      traits: [
        {
          id: 'dryness',
          name: 'Dryness',
          severity: 'moderate',
          description: 'Dry patches on cheeks',
        },
      ],
      notes: ['Increase hydration'],
      modelVersion: 'gpt-4o-mini',
    };

    const summary = mapVisionToSummary(userId, visionResult, completedAt);

    expect(summary.skin_type).toBe('dry');
    expect(summary.confidence).toBe(0.92);
  });

  it('should map Combination skin type correctly', () => {
    const visionResult: VisionAnalysis = {
      skinType: 'Combination',
      confidence: 88,
      primaryConcern: 'Mixed skin zones',
      traits: [
        {
          id: 'oiliness',
          name: 'Oiliness',
          severity: 'moderate',
          description: 'Oily T-zone',
        },
        {
          id: 'dryness',
          name: 'Dryness',
          severity: 'low',
          description: 'Dry cheeks',
        },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const summary = mapVisionToSummary(userId, visionResult, completedAt);

    expect(summary.skin_type).toBe('combination');
  });

  it('should map Normal and Sensitive skin types', () => {
    const normalResult: VisionAnalysis = {
      skinType: 'Normal',
      confidence: 95,
      primaryConcern: 'None',
      traits: [
        { id: 'healthy', name: 'Healthy', severity: 'low', description: 'Good condition' },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const normalSummary = mapVisionToSummary(userId, normalResult, completedAt);
    expect(normalSummary.skin_type).toBe('normal');

    const sensitiveResult: VisionAnalysis = {
      skinType: 'Sensitive',
      confidence: 80,
      primaryConcern: 'Reactivity',
      traits: [
        { id: 'sensitivity', name: 'Sensitivity', severity: 'high', description: 'Easily irritated' },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const sensitiveSummary = mapVisionToSummary(userId, sensitiveResult, completedAt);
    expect(sensitiveSummary.skin_type).toBe('sensitive');
  });

  it('should map trait severities to scores correctly', () => {
    const visionResult: VisionAnalysis = {
      skinType: 'Combination',
      confidence: 87,
      primaryConcern: 'Acne',
      traits: [
        { id: 'acne', name: 'Acne', severity: 'high', description: 'Severe breakouts' },
        { id: 'dryness', name: 'Dryness', severity: 'moderate', description: 'Some dryness' },
        { id: 'hyperpigmentation', name: 'Hyperpigmentation', severity: 'low', description: 'Minor PIH' },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const summary = mapVisionToSummary(userId, visionResult, completedAt);

    expect(summary.series).toHaveLength(1);
    expect(summary.series[0].acne).toBe(85); // high severity
    expect(summary.series[0].dryness).toBe(55); // moderate severity
    expect(summary.series[0].pigmentation).toBe(25); // low severity
  });

  it('should default to 0 for missing traits', () => {
    const visionResult: VisionAnalysis = {
      skinType: 'Normal',
      confidence: 90,
      primaryConcern: 'None',
      traits: [
        // Only one trait, others should default to 0
        { id: 'sensitivity', name: 'Sensitivity', severity: 'low', description: 'Slight redness' },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const summary = mapVisionToSummary(userId, visionResult, completedAt);

    expect(summary.series[0].acne).toBe(0);
    expect(summary.series[0].dryness).toBe(0);
    expect(summary.series[0].pigmentation).toBe(0);
  });

  it('should preserve notes array', () => {
    const visionResult: VisionAnalysis = {
      skinType: 'Oily',
      confidence: 85,
      primaryConcern: 'Oiliness',
      traits: [
        { id: 'oiliness', name: 'Oiliness', severity: 'high', description: 'Very oily' },
      ],
      notes: [
        'Use oil-free moisturizer',
        'Consider BHA exfoliant',
        'Avoid heavy creams',
      ],
      modelVersion: 'gpt-4o-mini',
    };

    const summary = mapVisionToSummary(userId, visionResult, completedAt);

    expect(summary.notes).toEqual([
      'Use oil-free moisturizer',
      'Consider BHA exfoliant',
      'Avoid heavy creams',
    ]);
  });

  it('should create single-point time series', () => {
    const visionResult: VisionAnalysis = {
      skinType: 'Combination',
      confidence: 87,
      primaryConcern: 'Acne',
      traits: [
        { id: 'acne', name: 'Acne', severity: 'moderate', description: 'Active breakouts' },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const summary = mapVisionToSummary(userId, visionResult, completedAt);

    expect(summary.series).toHaveLength(1);
    expect(summary.series[0].date).toBe(completedAt);
  });

  it('should handle edge case: unknown skin type defaults to normal', () => {
    const visionResult: VisionAnalysis = {
      skinType: 'Unknown' as any, // Invalid type
      confidence: 80,
      primaryConcern: 'Unknown',
      traits: [
        { id: 'test', name: 'Test', severity: 'low', description: 'Test' },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const summary = mapVisionToSummary(userId, visionResult, completedAt);

    expect(summary.skin_type).toBe('normal'); // Fallback
  });

  it('should convert confidence from 0-100 to 0-1 scale', () => {
    const testCases = [
      { input: 0, expected: 0 },
      { input: 50, expected: 0.5 },
      { input: 100, expected: 1 },
      { input: 87, expected: 0.87 },
    ];

    for (const { input, expected } of testCases) {
      const visionResult: VisionAnalysis = {
        skinType: 'Normal',
        confidence: input,
        primaryConcern: 'Test',
        traits: [
          { id: 'test', name: 'Test', severity: 'low', description: 'Test' },
        ],
        notes: [],
        modelVersion: 'gpt-4o-mini',
      };

      const summary = mapVisionToSummary(userId, visionResult, completedAt);
      expect(summary.confidence).toBe(expected);
    }
  });

  it('should work with fixture data', async () => {
    const fixtureData = await import('../../tests/fixtures/vision.json');

    const summary = mapVisionToSummary(userId, fixtureData as VisionAnalysis, completedAt);

    expect(summary.user_id).toBe(userId);
    expect(summary.skin_type).toBe('combination');
    expect(summary.confidence).toBe(0.87);
    expect(summary.primary_concern).toBe('acne');
    expect(summary.series[0].acne).toBe(55); // moderate severity
    expect(summary.series[0].dryness).toBe(25); // low severity
    expect(summary.series[0].pigmentation).toBe(25); // low severity (hyperpigmentation)
    expect(summary.notes).toHaveLength(4);
  });
});
