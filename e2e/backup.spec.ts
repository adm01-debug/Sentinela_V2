import { test, expect } from '@playwright/test';

test.describe('Backup Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/backup');
    await expect(page).toHaveURL(/backup/);
  });

  test('should display main content', async ({ page }) => {
    await page.goto('/backup');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/backup');
    await expect(page.locator('body')).toBeVisible();
  });
});