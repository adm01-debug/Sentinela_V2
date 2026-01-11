import { test, expect } from '@playwright/test';
test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => { await page.goto('/dashboard'); await page.getByTestId('dark-mode-toggle').click(); await expect(page.locator('html')).toHaveClass(/dark/); });
});