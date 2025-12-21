import { test, expect } from '@playwright/test';

test.describe('Preferences Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/preferences');
    await expect(page).toHaveURL(/preferences/);
  });

  test('should display main content', async ({ page }) => {
    await page.goto('/preferences');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/preferences');
    await expect(page.locator('body')).toBeVisible();
  });
});