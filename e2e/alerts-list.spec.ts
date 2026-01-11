import { test, expect } from '@playwright/test';
test.describe('Alerts List', () => {
  test('should display alerts', async ({ page }) => { await page.goto('/alerts'); await expect(page.getByTestId('alert-list')).toBeVisible(); });
  test('should acknowledge alert', async ({ page }) => { await page.goto('/alerts'); await page.getByRole('button', { name: 'Acknowledge' }).first().click(); await expect(page.getByText('Alert acknowledged')).toBeVisible(); });
});