import { test, expect } from '@playwright/test';

test.describe('Violations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/violations');
  });

  test('should display violations page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /viola/i })).toBeVisible();
  });

  test('should have severity filter', async ({ page }) => {
    const filters = page.locator('[role="combobox"]');
    await expect(filters.first()).toBeVisible();
  });

  test('should have status filter', async ({ page }) => {
    const filters = page.locator('[role="combobox"]');
    const count = await filters.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should have search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
  });

  test('should show stats cards', async ({ page }) => {
    await expect(page.getByText(/abertas/i)).toBeVisible();
  });

  test('should filter by severity', async ({ page }) => {
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole('option', { name: /critica/i }).click();
  });
});
