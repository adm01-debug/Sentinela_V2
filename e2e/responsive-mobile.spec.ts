import { test, expect, devices } from '@playwright/test';
test.use({ ...devices['iPhone 12'] });
test.describe('Mobile', () => {
  test('should show mobile menu', async ({ page }) => { await page.goto('/dashboard'); await expect(page.getByTestId('mobile-menu-button')).toBeVisible(); });
  test('should open mobile sidebar', async ({ page }) => { await page.goto('/dashboard'); await page.getByTestId('mobile-menu-button').click(); await expect(page.getByTestId('mobile-sidebar')).toBeVisible(); });
});