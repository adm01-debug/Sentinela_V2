import { test, expect } from '@playwright/test';
test.describe('Breadcrumbs', () => {
  test('should display breadcrumbs', async ({ page }) => { await page.goto('/employees/123'); await expect(page.getByTestId('breadcrumbs')).toContainText('Employees'); });
  test('should navigate via breadcrumbs', async ({ page }) => { await page.goto('/employees/123'); await page.getByRole('link', { name: 'Employees' }).click(); await expect(page).toHaveURL('/employees'); });
});