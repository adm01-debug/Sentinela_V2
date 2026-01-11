import { test, expect, devices } from '@playwright/test';
test.use({ ...devices['iPad Pro'] });
test.describe('Tablet', () => {
  test('should display tablet layout', async ({ page }) => { await page.goto('/dashboard'); await expect(page.getByTestId('sidebar')).toBeVisible(); });
});