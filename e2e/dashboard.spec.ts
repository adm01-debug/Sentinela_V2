import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/auth/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ user: { id: '1', email: 'test@test.com' } }),
      });
    });
    
    await page.goto('/');
  });

  test('should display dashboard stats', async ({ page }) => {
    await expect(page.getByText(/funcionários|employees/i)).toBeVisible();
  });

  test('should have navigation sidebar', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should navigate to employees page', async ({ page }) => {
    await page.getByRole('link', { name: /funcionários|employees/i }).click();
    await expect(page).toHaveURL(/employees|funcionarios/);
  });

  test('should navigate to violations page', async ({ page }) => {
    await page.getByRole('link', { name: /violações|violations/i }).click();
    await expect(page).toHaveURL(/violations|violacoes/);
  });

  test('should navigate to settings', async ({ page }) => {
    await page.getByRole('link', { name: /configurações|settings/i }).click();
    await expect(page).toHaveURL(/settings|configuracoes/);
  });
});
