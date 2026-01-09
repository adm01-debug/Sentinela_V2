import { test, expect } from '@playwright/test';

test.describe('Dashboard Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display main metrics', async ({ page }) => {
    await expect(page.getByTestId('total-employees')).toBeVisible();
    await expect(page.getByTestId('active-violations')).toBeVisible();
    await expect(page.getByTestId('productivity-score')).toBeVisible();
    await expect(page.getByTestId('online-users')).toBeVisible();
  });

  test('should display activity chart', async ({ page }) => {
    await expect(page.getByTestId('activity-chart')).toBeVisible();
  });

  test('should display recent violations', async ({ page }) => {
    await expect(page.getByTestId('recent-violations')).toBeVisible();
  });

  test('should refresh data', async ({ page }) => {
    await page.getByRole('button', { name: /atualizar/i }).click();
    await expect(page.getByText(/atualizado/i)).toBeVisible();
  });

  test('should change date range', async ({ page }) => {
    await page.getByRole('button', { name: /período/i }).click();
    await page.getByRole('option', { name: /últimos 7 dias/i }).click();
    await expect(page.getByText(/7 dias/i)).toBeVisible();
  });

  test('should navigate to employee details', async ({ page }) => {
    await page.getByTestId('top-employees').getByRole('link').first().click();
    await expect(page).toHaveURL(/employees/);
  });

  test('should display loading state', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.reload();
    await expect(page.getByTestId('loading-skeleton')).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    await page.route('**/api/dashboard', route => route.fulfill({ json: { data: [] } }));
    await page.reload();
    await expect(page.getByText(/nenhum dado/i)).toBeVisible();
  });

  test('should export dashboard data', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /exportar/i }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('dashboard');
  });
});
