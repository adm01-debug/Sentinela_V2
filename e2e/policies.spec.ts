import { test, expect } from '@playwright/test';

test.describe('Monitoring Policies Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/monitoring-policies');
  });

  test('should display policies page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /politicas/i })).toBeVisible();
  });

  test('should have create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /nova politica/i })).toBeVisible();
  });

  test('should open create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nova politica/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should have tracking toggles in dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nova politica/i }).click();
    await expect(page.getByText(/rastrear atividade/i)).toBeVisible();
    await expect(page.getByText(/rastrear aplicativos/i)).toBeVisible();
  });

  test('should show stats cards', async ({ page }) => {
    await expect(page.getByText(/ativas/i)).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
  });
});
