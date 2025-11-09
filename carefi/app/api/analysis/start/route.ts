/**
 * POST /api/analysis/start
 *
 * Triggers OpenAI Vision skin analysis for the authenticated user.
 *
 * Flow:
 * 1. Validates user authentication
 * 2. Checks rate limit (3 analyses per hour per user)
 * 3. Calls analysis service to orchestrate OpenAI Vision
 * 4. Returns AnalysisSummary on success
 *
 * Rate Limiting:
 * - Per-user limit: 3 analyses per hour
 * - Returns 429 Too Many Requests when exceeded
 * - Simple in-memory token bucket implementation
 *
 * Errors:
 * - 401: Unauthorized (not logged in)
 * - 400: Bad Request (missing images)
 * - 429: Too Many Requests (rate limit exceeded)
 * - 500: Internal Server Error (OpenAI or database failures)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { startOpenAIVisionAnalysis, AnalysisServiceError } from '@/lib/analysis/service';
import { ok, fail, unauthorized } from '@/lib/http/response';

/**
 * Rate limiter implementation
 * Simple in-memory token bucket per user
 */
class RateLimiter {
  private buckets = new Map<string, { tokens: number; lastRefill: number }>();
  private readonly maxTokens: number;
  private readonly refillIntervalMs: number;
  private readonly tokensPerRefill: number;

  constructor(
    maxTokens: number,
    refillIntervalMs: number,
    tokensPerRefill: number = maxTokens
  ) {
    this.maxTokens = maxTokens;
    this.refillIntervalMs = refillIntervalMs;
    this.tokensPerRefill = tokensPerRefill;
  }

  /**
   * Check if request is allowed and consume a token
   *
   * @param key - User ID or IP address
   * @returns True if allowed, false if rate limited
   */
  checkLimit(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    // Initialize bucket if doesn't exist
    if (!bucket) {
      bucket = {
        tokens: this.maxTokens - 1, // Consume one token
        lastRefill: now,
      };
      this.buckets.set(key, bucket);
      return true;
    }

    // Refill tokens based on time elapsed
    const timeSinceRefill = now - bucket.lastRefill;
    const refillsEarned = Math.floor(timeSinceRefill / this.refillIntervalMs);

    if (refillsEarned > 0) {
      bucket.tokens = Math.min(
        this.maxTokens,
        bucket.tokens + refillsEarned * this.tokensPerRefill
      );
      bucket.lastRefill = now;
    }

    // Check if we have tokens available
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }

    return false;
  }

  /**
   * Get time until next token is available
   *
   * @param key - User ID or IP address
   * @returns Milliseconds until next refill
   */
  getRetryAfter(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket) return 0;

    const now = Date.now();
    const timeSinceRefill = now - bucket.lastRefill;
    const timeUntilRefill = this.refillIntervalMs - timeSinceRefill;

    return Math.max(0, timeUntilRefill);
  }

  /**
   * Clean up old buckets (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = this.refillIntervalMs * 2;

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge && bucket.tokens === this.maxTokens) {
        this.buckets.delete(key);
      }
    }
  }
}

// Global rate limiter instance
// 3 analyses per hour (3600000ms)
const rateLimiter = new RateLimiter(3, 0, 3);

// Clean up rate limiter every 10 minutes
setInterval(() => rateLimiter.cleanup(), 600000);

/**
 * POST handler for starting skin analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized('You must be logged in to start an analysis');
    }

    console.log(`[API] /api/analysis/start - User ${user.id}`);

    // Step 2: Check rate limit
    const rateLimitKey = user.id;
    const allowed = rateLimiter.checkLimit(rateLimitKey);

    if (!allowed) {
      const retryAfterMs = rateLimiter.getRetryAfter(rateLimitKey);
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

      console.warn(`[API] Rate limit exceeded for user ${user.id}`);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'rate_limit_exceeded',
            message: 'You have exceeded the analysis rate limit',
            details: {
              limit: '3 analyses per hour',
              retryAfter: retryAfterSeconds,
              retryAfterHuman: `${Math.ceil(retryAfterSeconds / 60)} minutes`,
            },
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSeconds.toString(),
          },
        }
      );
    }

    // Step 3: Start analysis
    console.log('[API] Starting OpenAI Vision analysis...');
    const summary = await startOpenAIVisionAnalysis(user.id);

    console.log('[API] Analysis completed successfully');
    return ok(summary);
  } catch (error) {
    console.error('[API] /api/analysis/start error:', error);

    // Handle known error types
    if (error instanceof AnalysisServiceError) {
      const statusCode = error.code === 'missing_images' ? 400 : 500;

      return fail(statusCode, error.code, error.userMessage, {
        technicalMessage: error.message,
      });
    }

    // Unknown error
    return fail(
      500,
      'internal_server_error',
      'An unexpected error occurred while starting the analysis. Please try again.',
      {
        technicalMessage: error instanceof Error ? error.message : 'Unknown error',
      }
    );
  }
}
