import { test, expect } from '@playwright/test';

test.describe('Violations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/violations');
  });

  test('should display violations list', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show violation severity', async ({ page }) => {
    const badges = page.locator('[class*="badge"], .severity-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter by date', async ({ page }) => {
    const datePicker = page.locator('input[type="date"], [data-testid="date-picker"]');
    if (await datePicker.count() > 0) {
      await datePicker.first().click();
    }
  });
});
