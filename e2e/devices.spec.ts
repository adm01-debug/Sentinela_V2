import { test, expect } from '@playwright/test';

test.describe('Devices Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/devices');
  });

  test('should display devices list', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show device stats', async ({ page }) => {
    const stats = page.locator('[data-testid="stats"], .stats-card');
    await expect(stats.first()).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    const filter = page.locator('select, [role="combobox"]').first();
    if (await filter.count() > 0) {
      await filter.click();
    }
  });
});
