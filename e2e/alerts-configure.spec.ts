import { test, expect } from '@playwright/test';
test.describe('Alert Configuration', () => {
  test('should configure alert threshold', async ({ page }) => { await page.goto('/alerts/configure'); await page.getByLabel('CPU Threshold').fill('90'); await page.getByRole('button', { name: 'Save' }).click(); await expect(page.getByText('Configuration saved')).toBeVisible(); });
});