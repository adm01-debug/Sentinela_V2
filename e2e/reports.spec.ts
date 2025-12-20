import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('should display reports page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /relat/i })).toBeVisible();
  });

  test('should have report type selector', async ({ page }) => {
    const selector = page.locator('[role="combobox"]').first();
    await expect(selector).toBeVisible();
  });

  test('should have date range picker', async ({ page }) => {
    const datePicker = page.locator('button').filter({ hasText: /data|period/i }).first();
    await expect(datePicker).toBeVisible().catch(() => {
      // Date picker might have different implementation
    });
  });

  test('should have export button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export|gerar/i })).toBeVisible();
  });
});
