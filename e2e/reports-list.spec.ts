import { test, expect } from '@playwright/test';
test.describe('Reports', () => {
  test('should display reports list', async ({ page }) => { await page.goto('/reports'); await expect(page.getByRole('table')).toBeVisible(); });
  test('should generate new report', async ({ page }) => { await page.goto('/reports'); await page.getByRole('button', { name: 'Generate Report' }).click(); await expect(page.getByText('Report generated')).toBeVisible(); });
});