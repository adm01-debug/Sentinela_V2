import { test, expect } from '@playwright/test';

test.describe('Help Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/help');
    await expect(page).toHaveURL(/help/);
  });

  test('should display main content', async ({ page }) => {
    await page.goto('/help');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/help');
    await expect(page.locator('body')).toBeVisible();
  });
});