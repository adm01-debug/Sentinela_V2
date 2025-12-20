import { test, expect } from '@playwright/test';

test.describe('Sensitive Keywords Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sensitive-keywords');
  });

  test('should display keywords page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /palavra/i })).toBeVisible();
  });

  test('should have create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /nova/i })).toBeVisible();
  });

  test('should open create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nova/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should have category filter', async ({ page }) => {
    await expect(page.locator('[role="combobox"]').first()).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
  });
});
