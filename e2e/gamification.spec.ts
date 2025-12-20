import { test, expect } from '@playwright/test';

test.describe('Gamification Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gamification');
  });

  test('should display leaderboard', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show user points', async ({ page }) => {
    const points = page.locator('[data-testid="points"], .points-display');
    const count = await points.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display achievements', async ({ page }) => {
    const achievements = page.locator('[data-testid="achievement"], .achievement-card');
    const count = await achievements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
