/**
 * OpenAI Vision Integration
 *
 * Provides client configuration, Zod schemas, and API call logic
 * for analyzing skin images using OpenAI's Vision API.
 *
 * IMPORTANT: Only use on the server side (API routes, server actions)
 * Never import this in client components as it requires the API key.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '@/lib/env';

/**
 * OpenAI client instance
 * Configured with API key from environment variables
 */
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * Vision model to use for analysis
 * Defaults to gpt-4o-mini for cost efficiency
 */
export const VISION_MODEL = env.OPENAI_VISION_MODEL;

/**
 * Schema for a single skin trait detected in the analysis
 */
export const SkinTraitSchema = z.object({
  id: z.string().min(1).describe('Kebab-case identifier (e.g., "acne", "dryness")'),
  name: z.string().min(1).describe('Human-readable label'),
  severity: z.enum(['low', 'moderate', 'high']).describe('Severity level'),
  description: z.string().min(1).describe('User-friendly description of the trait'),
});

export type SkinTrait = z.infer<typeof SkinTraitSchema>;

/**
 * Schema for the complete vision analysis response
 * This validates the JSON returned by OpenAI
 */
export const VisionAnalysisSchema = z.object({
  skinType: z.enum(['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive']).describe('Overall skin type classification'),
  confidence: z.number().min(0).max(100).describe('Confidence score 0-100'),
  primaryConcern: z.string().min(1).describe('Main skin concern identified'),
  traits: z.array(SkinTraitSchema).min(1).describe('Array of detected skin traits'),
  notes: z.array(z.string()).default([]).describe('Additional observations and recommendations'),
  modelVersion: z.string().min(1).describe('Model identifier for tracking'),
});

export type VisionAnalysis = z.infer<typeof VisionAnalysisSchema>;

/**
 * Build the system prompt for OpenAI Vision
 *
 * Instructs the model to:
 * - Analyze skin for specific traits
 * - Return strict JSON matching VisionAnalysisSchema
 * - Consider all three image angles jointly
 * - Rate severities consistently
 * - Provide user-friendly notes
 *
 * @returns System prompt string
 */
export function buildVisionPrompt(): string {
  return `You are a dermatologist assistant specializing in skin analysis. Given three facial images (front view, left 45° view, right 45° view), perform a comprehensive skin analysis.

ANALYSIS REQUIREMENTS:
1. Determine the overall skin type: Dry, Oily, Combination, Normal, or Sensitive
2. Estimate confidence in your analysis (0-100 scale)
3. Identify the primary concern (most prominent issue)
4. Detect and rate the following skin traits:
   - acne: Active breakouts, comedones, or acne-prone areas
   - dryness: Dry patches, flakiness, or dehydrated appearance
   - oiliness: Excess sebum, shine, or enlarged pores from oil
   - sensitivity: Redness, reactivity, or inflammation signs
   - hyperpigmentation: Dark spots, melasma, or uneven tone
   - fine-lines: Early wrinkles, expression lines, or age signs
   - redness: General redness, rosacea, or irritation
   - large-pores: Visibly enlarged pores

SEVERITY RATINGS:
- low: Minimal presence, barely noticeable
- moderate: Clearly visible, affecting some areas
- high: Prominent, widespread, or severe

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact schema (no additional text):
{
  "skinType": "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive",
  "confidence": <number 0-100>,
  "primaryConcern": "<string>",
  "traits": [
    {
      "id": "<kebab-case-id>",
      "name": "<Human Name>",
      "severity": "low" | "moderate" | "high",
      "description": "<Brief user-friendly description>"
    }
  ],
  "notes": [
    "<Observation or recommendation>"
  ],
  "modelVersion": "${VISION_MODEL}"
}

IMPORTANT GUIDELINES:
- Consider all three image angles together for a complete assessment
- Only include traits that are actually present (at least at low severity)
- Keep descriptions concise and user-friendly (avoid medical jargon)
- Provide 2-4 actionable notes about skincare recommendations
- Return ONLY the JSON object, no markdown formatting or extra text`;
}

/**
 * Error class for OpenAI Vision API failures
 */
export class VisionAnalysisError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'VisionAnalysisError';
  }
}

/**
 * Retry configuration for API calls
 */
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

/**
 * Calculate exponential backoff delay with jitter
 *
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
function getRetryDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

/**
 * Determine if an error is retryable
 *
 * @param error - Error from OpenAI API
 * @returns True if the error warrants a retry
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    // Retry on rate limits and server errors
    return error.status === 429 || (error.status >= 500 && error.status < 600);
  }
  return false;
}

/**
 * Call OpenAI Vision API with retry logic
 *
 * Sends three image URLs to OpenAI Vision for skin analysis.
 * Implements exponential backoff with jitter for rate limits and server errors.
 * Validates response against VisionAnalysisSchema.
 *
 * @param imageUrls - Array of signed URLs (must be exactly 3)
 * @returns Parsed and validated VisionAnalysis object
 * @throws VisionAnalysisError on validation or API failures
 */
export async function callVision(imageUrls: string[]): Promise<VisionAnalysis> {
  // Validate input
  if (imageUrls.length !== 3) {
    throw new VisionAnalysisError(
      `Expected exactly 3 image URLs, received ${imageUrls.length}`,
      undefined,
      false
    );
  }

  // Check for valid URLs
  for (const url of imageUrls) {
    try {
      new URL(url);
    } catch {
      throw new VisionAnalysisError(
        `Invalid image URL: ${url.substring(0, 50)}...`,
        undefined,
        false
      );
    }
  }

  let lastError: unknown;

  // Retry loop
  for (let attempt = 0; attempt < RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      // Add delay for retries
      if (attempt > 0) {
        const delay = getRetryDelay(attempt - 1);
        console.log(`[OpenAI] Retry attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      console.log(`[OpenAI] Calling Vision API (attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts})`);
      console.log(`[OpenAI] Model: ${VISION_MODEL}`);

      // Build message content with text instruction + 3 images
      const content: OpenAI.Chat.ChatCompletionContentPart[] = [
        {
          type: 'text',
          text: buildVisionPrompt(),
        },
        ...imageUrls.map((url) => ({
          type: 'image_url' as const,
          image_url: {
            url,
            detail: 'high' as const, // Use high detail for better analysis
          },
        })),
      ];

      // Call OpenAI Chat Completions API with vision
      const response = await openai.chat.completions.create({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent analysis
        response_format: { type: 'json_object' }, // Ensure JSON response
      });

      // Extract response content
      const content_text = response.choices[0]?.message?.content;
      if (!content_text) {
        throw new VisionAnalysisError(
          'OpenAI returned empty response',
          undefined,
          true
        );
      }

      console.log(`[OpenAI] Received response (${content_text.length} chars)`);

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(content_text);
      } catch (parseError) {
        throw new VisionAnalysisError(
          'OpenAI response is not valid JSON',
          parseError,
          false
        );
      }

      // Validate against schema
      const validationResult = VisionAnalysisSchema.safeParse(parsed);
      if (!validationResult.success) {
        console.error('[OpenAI] Schema validation failed:', validationResult.error.errors);
        throw new VisionAnalysisError(
          'OpenAI response does not match expected schema',
          validationResult.error,
          false
        );
      }

      console.log(`[OpenAI] Analysis complete:`, {
        skinType: validationResult.data.skinType,
        confidence: validationResult.data.confidence,
        traitsCount: validationResult.data.traits.length,
      });

      return validationResult.data;
    } catch (error) {
      lastError = error;

      // Don't retry non-retryable errors
      if (error instanceof VisionAnalysisError && !error.retryable) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === RETRY_CONFIG.maxAttempts - 1) {
        break;
      }

      // Check if we should retry
      if (!isRetryableError(error)) {
        throw error;
      }

      console.warn(`[OpenAI] Retryable error on attempt ${attempt + 1}:`, error);
    }
  }

  // All retries exhausted
  throw new VisionAnalysisError(
    `OpenAI Vision API failed after ${RETRY_CONFIG.maxAttempts} attempts`,
    lastError,
    false
  );
}
