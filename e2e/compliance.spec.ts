import { test, expect } from '@playwright/test';

test.describe('Compliance Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/compliance');
    await expect(page).toHaveURL(/compliance/);
  });

  test('should display main content', async ({ page }) => {
    await page.goto('/compliance');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/compliance');
    await expect(page.locator('body')).toBeVisible();
  });
});