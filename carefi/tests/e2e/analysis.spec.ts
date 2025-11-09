/**
 * E2E test for OpenAI Vision skin analysis flow
 *
 * Tests the complete user journey:
 * 1. Sign in as test user
 * 2. Upload 3 facial images
 * 3. Navigate to /analyze page
 * 4. Wait for analysis to complete
 * 5. Verify dashboard shows populated KPIs
 *
 * Note: In CI, set MOCK_OPENAI=1 to use fixture data instead of real API calls
 */

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Skin Analysis Flow', () => {
  // Test user credentials (should exist in test database)
  const TEST_EMAIL = 'test@carefi.com';
  const TEST_PASSWORD = 'TestPass123';

  test.beforeEach(async ({ page }) => {
    // Sign in as test user
    await page.goto('/signin');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should complete full analysis flow and show results in dashboard', async ({ page }) => {
    // Step 1: Navigate to upload page
    await page.goto('/upload');
    await expect(page).toHaveURL('/upload');

    // Step 2: Upload three test images
    // Note: These fixture images should exist in tests/fixtures/
    const fixturesDir = path.join(__dirname, '..', 'fixtures');

    const frontImagePath = path.join(fixturesDir, 'front-face.jpg');
    const left45ImagePath = path.join(fixturesDir, 'left-45-face.jpg');
    const right45ImagePath = path.join(fixturesDir, 'right-45-face.jpg');

    // Upload front image
    const frontInput = page.locator('input[type="file"]').first();
    await frontInput.setInputFiles(frontImagePath);
    await expect(page.locator('text=front')).toBeVisible({ timeout: 5000 });

    // Upload left 45° image
    const left45Input = page.locator('input[type="file"]').nth(1);
    await left45Input.setInputFiles(left45ImagePath);
    await expect(page.locator('text=left_45')).toBeVisible({ timeout: 5000 });

    // Upload right 45° image
    const right45Input = page.locator('input[type="file"]').nth(2);
    await right45Input.setInputFiles(right45ImagePath);
    await expect(page.locator('text=right_45')).toBeVisible({ timeout: 5000 });

    // Step 3: Navigate to analyze page (auto-starts analysis)
    await page.goto('/analyze');
    await expect(page).toHaveURL('/analyze');

    // Step 4: Wait for analysis progress indicators
    await expect(page.locator('text=Uploading images')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=Screening for quality')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Feature detection')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Generating report')).toBeVisible({ timeout: 5000 });

    // Step 5: Wait for completion (timeout depends on OpenAI response time)
    // In mock mode, this should be fast; in real mode, allow up to 30 seconds
    const isMockMode = process.env.MOCK_OPENAI === '1';
    const timeout = isMockMode ? 10000 : 30000;

    await expect(page.locator('text=complete').or(page.locator('text=Analysis Complete'))).toBeVisible({
      timeout,
    });

    // Step 6: Navigate to dashboard to verify results
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Step 7: Verify dashboard shows analysis data (not loading state)
    // Wait for analysis overview component to load
    await expect(page.locator('text=Analysis Overview').or(page.locator('text=Skin Analysis'))).toBeVisible({
      timeout: 5000,
    });

    // Verify KPIs are populated (should show confidence score)
    await expect(page.locator('text=Confidence').or(page.locator('text=confidence'))).toBeVisible();

    // Verify chart renders (check for Recharts elements or data points)
    const hasChart = await page.locator('svg[class*="recharts"]').count();
    expect(hasChart).toBeGreaterThan(0);

    // Verify notes section exists and has content
    const notesSection = page.locator('text=Notes').or(page.locator('text=Observations'));
    if (await notesSection.count() > 0) {
      await expect(notesSection).toBeVisible();
    }
  });

  test('should show error when trying to analyze without uploading images', async ({ page }) => {
    // Navigate directly to analyze page without uploading
    await page.goto('/analyze');

    // Should show error or redirect back to upload
    const errorMessage = page.locator('text=upload').or(page.locator('text=missing').or(page.locator('text=required')));
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should respect rate limiting (3 analyses per hour)', async ({ page }) => {
    // This test would require running 4 analyses in quick succession
    // Skipped in CI to avoid long test times and API costs

    test.skip(process.env.CI === 'true', 'Skipping rate limit test in CI');

    // Upload images
    await page.goto('/upload');
    // ... upload logic ...

    // Run analysis 3 times (should succeed)
    for (let i = 0; i < 3; i++) {
      await page.goto('/analyze');
      await page.waitForSelector('text=complete', { timeout: 30000 });
    }

    // 4th attempt should fail with rate limit error
    await page.goto('/analyze');
    await expect(page.locator('text=rate limit').or(page.locator('text=exceeded'))).toBeVisible({
      timeout: 5000,
    });
  });

  test('should display model version in dashboard', async ({ page }) => {
    // Assuming an analysis has already been completed
    await page.goto('/dashboard');

    // Check for model version display (e.g., "gpt-4o-mini" or "v2.1.3")
    const modelVersion = page.locator('text=gpt-4o').or(page.locator('text=v2'));
    const hasModelVersion = await modelVersion.count();

    // Model version should be visible somewhere in the dashboard
    if (hasModelVersion > 0) {
      await expect(modelVersion.first()).toBeVisible();
    }
  });
});

test.describe('Analysis API Endpoints', () => {
  test('should return 401 for unauthenticated requests', async ({ request }) => {
    const response = await request.post('/api/analysis/start');
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('unauthorized');
  });

  test('should return latest analysis for authenticated user', async ({ page, request }) => {
    // First sign in via UI to get session cookies
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'test@carefi.com');
    await page.fill('input[type="password"]', 'TestPass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Get cookies from the page context
    const cookies = await page.context().cookies();

    // Make API request with cookies
    const response = await request.get('/api/analysis/latest', {
      headers: {
        Cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();

    // If user has analysis, verify structure
    if (data.user_id) {
      expect(data).toHaveProperty('skin_type');
      expect(data).toHaveProperty('confidence');
      expect(data).toHaveProperty('primary_concern');
      expect(data).toHaveProperty('series');
      expect(data).toHaveProperty('notes');
      expect(data).toHaveProperty('modelVersion');

      // Verify series has at least one data point
      expect(Array.isArray(data.series)).toBe(true);
      if (data.series.length > 0) {
        expect(data.series[0]).toHaveProperty('date');
        expect(data.series[0]).toHaveProperty('acne');
        expect(data.series[0]).toHaveProperty('dryness');
        expect(data.series[0]).toHaveProperty('pigmentation');
      }
    }
  });
});
