import { test, expect } from '@playwright/test';
test.describe('Sidebar Navigation', () => {
  test('should navigate to all sections', async ({ page }) => { await page.goto('/dashboard'); await page.getByRole('link', { name: 'Employees' }).click(); await expect(page).toHaveURL('/employees'); await page.getByRole('link', { name: 'Reports' }).click(); await expect(page).toHaveURL('/reports'); });
  test('should collapse sidebar', async ({ page }) => { await page.goto('/dashboard'); await page.getByTestId('collapse-sidebar').click(); await expect(page.getByTestId('sidebar')).toHaveClass(/collapsed/); });
});