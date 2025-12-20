import { test, expect } from '@playwright/test';

test.describe('Message Templates Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/message-templates');
  });

  test('should display templates page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /template/i })).toBeVisible();
  });

  test('should have create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /novo|create/i })).toBeVisible();
  });

  test('should open create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /novo|create/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should have category filter', async ({ page }) => {
    const filter = page.locator('[role="combobox"]').first();
    await expect(filter).toBeVisible();
  });
});
