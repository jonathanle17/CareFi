/**
 * Unit tests for OpenAI Vision integration
 *
 * Tests Zod schema validation with valid and invalid samples
 */

import { describe, it, expect } from 'vitest';
import { SkinTraitSchema, VisionAnalysisSchema } from './openai';

describe('SkinTraitSchema', () => {
  it('should validate a valid skin trait', () => {
    const validTrait = {
      id: 'acne',
      name: 'Acne',
      severity: 'moderate' as const,
      description: 'Active breakouts detected in T-zone',
    };

    const result = SkinTraitSchema.safeParse(validTrait);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validTrait);
    }
  });

  it('should reject trait with invalid severity', () => {
    const invalidTrait = {
      id: 'acne',
      name: 'Acne',
      severity: 'extreme', // Invalid
      description: 'Active breakouts',
    };

    const result = SkinTraitSchema.safeParse(invalidTrait);
    expect(result.success).toBe(false);
  });

  it('should reject trait with missing id', () => {
    const invalidTrait = {
      name: 'Acne',
      severity: 'moderate',
      description: 'Active breakouts',
    };

    const result = SkinTraitSchema.safeParse(invalidTrait);
    expect(result.success).toBe(false);
  });

  it('should reject trait with empty description', () => {
    const invalidTrait = {
      id: 'acne',
      name: 'Acne',
      severity: 'low',
      description: '', // Empty not allowed
    };

    const result = SkinTraitSchema.safeParse(invalidTrait);
    expect(result.success).toBe(false);
  });

  it('should accept all valid severity levels', () => {
    const severities: Array<'low' | 'moderate' | 'high'> = ['low', 'moderate', 'high'];

    for (const severity of severities) {
      const trait = {
        id: 'test',
        name: 'Test',
        severity,
        description: 'Test description',
      };

      const result = SkinTraitSchema.safeParse(trait);
      expect(result.success).toBe(true);
    }
  });
});

describe('VisionAnalysisSchema', () => {
  it('should validate a complete analysis response', () => {
    const validAnalysis = {
      skinType: 'Combination',
      confidence: 87,
      primaryConcern: 'acne',
      traits: [
        {
          id: 'acne',
          name: 'Acne',
          severity: 'moderate' as const,
          description: 'Active breakouts visible',
        },
        {
          id: 'oiliness',
          name: 'Oiliness',
          severity: 'moderate' as const,
          description: 'Excess sebum in T-zone',
        },
      ],
      notes: [
        'Consider BHA exfoliant 2-3x per week',
        'Use non-comedogenic moisturizer',
      ],
      modelVersion: 'gpt-4o-mini',
    };

    const result = VisionAnalysisSchema.safeParse(validAnalysis);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skinType).toBe('Combination');
      expect(result.data.traits).toHaveLength(2);
      expect(result.data.notes).toHaveLength(2);
    }
  });

  it('should accept analysis with empty notes (defaults to [])', () => {
    const analysis = {
      skinType: 'Normal',
      confidence: 95,
      primaryConcern: 'none',
      traits: [
        {
          id: 'normal',
          name: 'Normal',
          severity: 'low' as const,
          description: 'Healthy skin',
        },
      ],
      // notes omitted - should default to []
      modelVersion: 'gpt-4o-mini',
    };

    const result = VisionAnalysisSchema.safeParse(analysis);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toEqual([]);
    }
  });

  it('should reject analysis with invalid skin type', () => {
    const invalidAnalysis = {
      skinType: 'SuperOily', // Invalid type
      confidence: 80,
      primaryConcern: 'oiliness',
      traits: [
        {
          id: 'oiliness',
          name: 'Oiliness',
          severity: 'high',
          description: 'Very oily',
        },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const result = VisionAnalysisSchema.safeParse(invalidAnalysis);
    expect(result.success).toBe(false);
  });

  it('should reject analysis with confidence > 100', () => {
    const invalidAnalysis = {
      skinType: 'Oily',
      confidence: 150, // Out of range
      primaryConcern: 'oiliness',
      traits: [
        {
          id: 'oiliness',
          name: 'Oiliness',
          severity: 'high',
          description: 'Very oily',
        },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const result = VisionAnalysisSchema.safeParse(invalidAnalysis);
    expect(result.success).toBe(false);
  });

  it('should reject analysis with confidence < 0', () => {
    const invalidAnalysis = {
      skinType: 'Dry',
      confidence: -10, // Negative not allowed
      primaryConcern: 'dryness',
      traits: [
        {
          id: 'dryness',
          name: 'Dryness',
          severity: 'moderate',
          description: 'Dry patches',
        },
      ],
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const result = VisionAnalysisSchema.safeParse(invalidAnalysis);
    expect(result.success).toBe(false);
  });

  it('should reject analysis with empty traits array', () => {
    const invalidAnalysis = {
      skinType: 'Normal',
      confidence: 90,
      primaryConcern: 'none',
      traits: [], // Must have at least 1 trait
      notes: [],
      modelVersion: 'gpt-4o-mini',
    };

    const result = VisionAnalysisSchema.safeParse(invalidAnalysis);
    expect(result.success).toBe(false);
  });

  it('should accept all valid skin types', () => {
    const skinTypes = ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'];

    for (const skinType of skinTypes) {
      const analysis = {
        skinType,
        confidence: 85,
        primaryConcern: 'test',
        traits: [
          {
            id: 'test',
            name: 'Test',
            severity: 'low' as const,
            description: 'Test',
          },
        ],
        notes: [],
        modelVersion: 'gpt-4o-mini',
      };

      const result = VisionAnalysisSchema.safeParse(analysis);
      expect(result.success).toBe(true);
    }
  });

  it('should validate fixture data', async () => {
    // Load the fixture file used in E2E tests
    const fixtureData = await import('../../tests/fixtures/vision.json');

    const result = VisionAnalysisSchema.safeParse(fixtureData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skinType).toBe('Combination');
      expect(result.data.confidence).toBe(87);
      expect(result.data.traits).toHaveLength(5);
      expect(result.data.notes).toHaveLength(4);
    }
  });
});
