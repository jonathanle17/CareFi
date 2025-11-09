import { test, expect } from '@playwright/test';

/**
 * Dashboard E2E Tests
 *
 * Note: These tests assume you have:
 * 1. A running Next.js dev server (pnpm dev)
 * 2. Valid Supabase credentials in .env
 * 3. Test user credentials for authentication
 *
 * For CI/CD, use environment variables or test fixtures
 */

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Replace with actual test user credentials or use Supabase test helpers
    // For now, this will test the unauthenticated redirect behavior
  });

  test('redirects to signin when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to signin page
    await expect(page).toHaveURL(/\/signin/);
  });

  test.describe('Authenticated Dashboard', () => {
    test.skip('displays all dashboard sections for authenticated user', async ({ page }) => {
      // TODO: Implement authentication flow
      // Example:
      // await page.goto('/signin');
      // await page.fill('input[name="email"]', 'test@example.com');
      // await page.fill('input[name="password"]', 'testpassword');
      // await page.click('button[type="submit"]');
      // await page.waitForURL('/dashboard');

      await page.goto('/dashboard');

      // Check for header elements
      await expect(page.locator('h1')).toContainText(/Hi,|Welcome back/);
      await expect(page.getByRole('link', { name: /Upload photos/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Update routine/i })).toBeVisible();

      // Check for KPI cards
      await expect(page.locator('text=Skin Type')).toBeVisible();
      await expect(page.locator('text=Primary Concern')).toBeVisible();
      await expect(page.locator('text=Budget Window')).toBeVisible();
      await expect(page.locator('text=Last Analysis')).toBeVisible();

      // Check for main sections
      await expect(page.locator('text=Analysis Overview')).toBeVisible();
      await expect(page.locator('text=Routine Planner')).toBeVisible();
      await expect(page.locator('text=Budget Optimizer')).toBeVisible();
      await expect(page.locator('text=Recommendations')).toBeVisible();
      await expect(page.locator('text=Insights & Alerts')).toBeVisible();

      // Check for chart rendering
      const chart = page.locator('[role="img"]').first(); // Recharts renders with role="img"
      await expect(chart).toBeVisible();

      // Check footer
      await expect(page.locator('text=/AI-generated/i')).toBeVisible();
      await expect(page.getByRole('link', { name: /feedback/i })).toBeVisible();
    });

    test.skip('budget slider updates recommendations', async ({ page }) => {
      // TODO: Implement authentication flow
      await page.goto('/dashboard');

      // Find the budget slider
      const slider = page.locator('input[type="range"]').first();
      await expect(slider).toBeVisible();

      // Get initial recommendation count
      const initialCount = await page.locator('[role="row"]').count();

      // Adjust slider (this is a simplified example)
      await slider.fill('100');

      // Wait for recommendations to update
      await page.waitForTimeout(500);

      // Verify recommendations changed (in real test, check specific products)
      const newCount = await page.locator('[role="row"]').count();
      expect(newCount).toBeGreaterThan(0);
    });

    test.skip('concern filter chips update recommendations', async ({ page }) => {
      // TODO: Implement authentication flow
      await page.goto('/dashboard');

      // Find concern filter chips
      const concernChip = page.locator('[role="button"]').filter({ hasText: /acne/i }).first();

      if (await concernChip.isVisible()) {
        // Click to toggle filter
        await concernChip.click();

        // Wait for recommendations to update
        await page.waitForTimeout(500);

        // Verify table updated
        const recommendations = page.locator('[role="row"]');
        expect(await recommendations.count()).toBeGreaterThan(0);
      }
    });

    test.skip('routine planner checkboxes work', async ({ page }) => {
      // TODO: Implement authentication flow
      await page.goto('/dashboard');

      // Find first checkbox in routine
      const checkbox = page.locator('input[type="checkbox"]').first();
      await expect(checkbox).toBeVisible();

      // Check initial state
      const wasChecked = await checkbox.isChecked();

      // Toggle checkbox
      await checkbox.click();

      // Verify state changed
      const isChecked = await checkbox.isChecked();
      expect(isChecked).toBe(!wasChecked);
    });
  });

  test('handles missing onboarding data gracefully', async ({ page }) => {
    // TODO: Create test user without onboarding data
    // Should redirect to /onboarding
    test.skip();
  });
});

/**
 * API Endpoint Tests
 */
test.describe('Dashboard API Endpoints', () => {
  test('GET /api/analysis/latest returns unauthorized without auth', async ({ request }) => {
    const response = await request.get('/api/analysis/latest');
    expect(response.status()).toBe(401);
  });

  test('GET /api/recommendations returns unauthorized without auth', async ({ request }) => {
    const response = await request.get('/api/recommendations');
    expect(response.status()).toBe(401);
  });

  test.skip('GET /api/analysis/latest returns data for authenticated user', async ({ request }) => {
    // TODO: Add authentication token
    // const response = await request.get('/api/analysis/latest', {
    //   headers: {
    //     'Authorization': 'Bearer YOUR_TOKEN_HERE'
    //   }
    // });
    // expect(response.status()).toBe(200);
    // const data = await response.json();
    // expect(data).toHaveProperty('skin_type');
    // expect(data).toHaveProperty('series');
  });

  test.skip('GET /api/recommendations filters by concern and budget', async ({ request }) => {
    // TODO: Add authentication token
    // const response = await request.get('/api/recommendations?concerns=acne&min=10&max=50');
    // expect(response.status()).toBe(200);
    // const data = await response.json();
    // expect(Array.isArray(data)).toBe(true);
  });
});
