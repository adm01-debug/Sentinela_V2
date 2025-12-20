import { test, expect } from '@playwright/test';

test.describe('Internet Access Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/internet-access');
  });

  test('should display internet access page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /controle|internet/i })).toBeVisible();
  });

  test('should have create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /nova/i })).toBeVisible();
  });

  test('should open create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nova/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should have type filter', async ({ page }) => {
    await expect(page.locator('[role="combobox"]').first()).toBeVisible();
  });

  test('should show stats cards', async ({ page }) => {
    await expect(page.getByText(/bloqueios/i)).toBeVisible();
  });
});
