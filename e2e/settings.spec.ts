import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /configurações/i })).toBeVisible();
  });

  test('should have profile section', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText(/perfil/i)).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/settings');
    await page.click('[data-testid="theme-toggle"]');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
