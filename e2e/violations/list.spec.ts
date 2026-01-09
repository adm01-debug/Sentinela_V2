import { test, expect } from '@playwright/test';

test.describe('Violations List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/violations');
  });

  test('should display violations table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should filter by severity', async ({ page }) => {
    await page.getByRole('combobox', { name: /severidade/i }).selectOption('high');
    await expect(page.getByTestId('severity-badge')).toHaveText(/alta/i);
  });

  test('should filter by status', async ({ page }) => {
    await page.getByRole('combobox', { name: /status/i }).selectOption('open');
    await expect(page.getByTestId('status-badge')).toHaveText(/aberta/i);
  });

  test('should filter by date range', async ({ page }) => {
    await page.getByRole('button', { name: /período/i }).click();
    await page.getByRole('option', { name: /últimos 7 dias/i }).click();
  });

  test('should search violations', async ({ page }) => {
    await page.getByPlaceholder(/buscar/i).fill('keyword');
    await expect(page.getByRole('row')).toHaveCount(2);
  });

  test('should navigate to violation detail', async ({ page }) => {
    await page.getByRole('row').nth(1).click();
    await expect(page).toHaveURL(/violations\/\d+/);
  });
});
