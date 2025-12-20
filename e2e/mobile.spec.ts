import { test, expect } from '@playwright/test';

test.describe('Mobile Monitoring Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mobile-monitoring');
  });

  test('should display mobile monitoring page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /mobile|movel/i })).toBeVisible();
  });

  test('should have list/map view toggle', async ({ page }) => {
    const toggleButtons = page.locator('button').filter({ has: page.locator('svg') });
    const count = await toggleButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show device stats', async ({ page }) => {
    await expect(page.getByText(/dispositivo|device/i).first()).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar|search/i)).toBeVisible();
  });
});
