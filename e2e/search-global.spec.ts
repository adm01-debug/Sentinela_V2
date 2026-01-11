import { test, expect } from '@playwright/test';
test.describe('Global Search', () => {
  test('should open with keyboard shortcut', async ({ page }) => { await page.goto('/dashboard'); await page.keyboard.press('Meta+k'); await expect(page.getByTestId('command-palette')).toBeVisible(); });
  test('should search employees', async ({ page }) => { await page.goto('/dashboard'); await page.getByTestId('search-input').fill('John'); await expect(page.getByTestId('search-results')).toContainText('John'); });
});