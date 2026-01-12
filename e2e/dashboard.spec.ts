import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@sentinela.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
  });

  test('should display dashboard stats', async ({ page }) => {
    await expect(page.getByTestId('stats-card')).toBeVisible();
  });

  test('should navigate to employees', async ({ page }) => {
    await page.click('text=Funcionários');
    await expect(page).toHaveURL(/employees/);
  });

  test('should show activity chart', async ({ page }) => {
    await expect(page.getByTestId('activity-chart')).toBeVisible();
  });
});
