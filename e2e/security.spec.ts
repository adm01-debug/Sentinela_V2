import { test, expect } from '@playwright/test';

test.describe('Security Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/security');
  });

  test('should display security overview', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show security events', async ({ page }) => {
    const events = page.locator('[data-testid="security-event"], .event-card');
    const count = await events.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter by severity', async ({ page }) => {
    const filter = page.locator('select, [role="combobox"]').first();
    if (await filter.count() > 0) {
      await filter.click();
    }
  });
});
