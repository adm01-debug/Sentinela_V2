import { test, expect } from '@playwright/test';

test.describe('Monitoring Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/monitoring');
  });

  test('should display monitoring page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /monitoramento/i })).toBeVisible();
  });

  test('should have view mode toggle', async ({ page }) => {
    const gridButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(gridButton).toBeVisible();
  });

  test('should have auto refresh toggle', async ({ page }) => {
    await expect(page.getByText(/auto/i)).toBeVisible();
  });

  test('should have status filter', async ({ page }) => {
    await expect(page.locator('[role="combobox"]').first()).toBeVisible();
  });

  test('should show stats cards', async ({ page }) => {
    const cards = page.locator('[data-testid="stat-card"], .card').first();
    await expect(cards).toBeVisible();
  });
});
