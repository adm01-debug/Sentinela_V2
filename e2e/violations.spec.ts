import { test, expect } from '@playwright/test';

test.describe('Violations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/violations');
  });

  test('should display violations page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /viola/i })).toBeVisible();
  });

  test('should have severity filter', async ({ page }) => {
    const filter = page.locator('[role="combobox"]').first();
    await expect(filter).toBeVisible();
  });

  test('should have status filter', async ({ page }) => {
    const filters = page.locator('[role="combobox"]');
    const count = await filters.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show violations list or empty state', async ({ page }) => {
    const hasViolations = await page.locator('[data-testid="violation-card"], .card').count() > 0;
    if (!hasViolations) {
      await expect(page.getByText(/nenhum|empty/i)).toBeVisible();
    }
  });
});
