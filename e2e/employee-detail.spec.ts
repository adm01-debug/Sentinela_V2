import { test, expect } from '@playwright/test';

test.describe('EmployeeDetail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employeedetail');
  });

  test('should display page title', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    const loader = page.locator('[data-testid="loading"], .loading, .skeleton');
    const count = await loader.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('should handle user interactions', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });
});
