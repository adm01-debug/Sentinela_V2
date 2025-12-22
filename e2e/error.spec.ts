import { test, expect } from '@playwright/test';

test.describe('error', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/error');
    await expect(page).toHaveURL(/error/);
  });
});