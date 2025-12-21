import { test, expect } from '@playwright/test';

test.describe('Onboarding Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/onboarding/);
  });

  test('should display main content', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/onboarding');
    await expect(page.locator('body')).toBeVisible();
  });
});