import { test, expect } from '@playwright/test';

test.describe('Employee Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees/1');
  });

  test('should display employee information', async ({ page }) => {
    await expect(page.getByTestId('employee-name')).toBeVisible();
    await expect(page.getByTestId('employee-email')).toBeVisible();
    await expect(page.getByTestId('employee-department')).toBeVisible();
    await expect(page.getByTestId('employee-status')).toBeVisible();
  });

  test('should display activity timeline', async ({ page }) => {
    await expect(page.getByTestId('activity-timeline')).toBeVisible();
  });

  test('should display violations history', async ({ page }) => {
    await page.getByRole('tab', { name: /violações/i }).click();
    await expect(page.getByTestId('violations-list')).toBeVisible();
  });

  test('should display productivity metrics', async ({ page }) => {
    await page.getByRole('tab', { name: /produtividade/i }).click();
    await expect(page.getByTestId('productivity-chart')).toBeVisible();
  });

  test('should navigate to edit', async ({ page }) => {
    await page.getByRole('button', { name: /editar/i }).click();
    await expect(page).toHaveURL(/employees\/1\/edit/);
  });

  test('should download report', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /baixar relatório/i }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('employee-report');
  });
});
