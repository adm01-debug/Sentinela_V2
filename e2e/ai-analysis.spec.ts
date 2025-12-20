import { test, expect } from '@playwright/test';

test.describe('AI Analysis Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-analysis');
  });

  test('should display AI analysis page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /an.*lise.*ia/i })).toBeVisible();
  });

  test('should have run analysis button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /executar/i })).toBeVisible();
  });

  test('should have employee filter', async ({ page }) => {
    await expect(page.locator('[role="combobox"]').first()).toBeVisible();
  });

  test('should have analysis type filter', async ({ page }) => {
    const filters = page.locator('[role="combobox"]');
    const count = await filters.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should show recent analyses section', async ({ page }) => {
    await expect(page.getByText(/recentes/i)).toBeVisible();
  });
});
