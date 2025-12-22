import { test, expect } from '@playwright/test';

test.describe('billingsettings', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/billingsettings');
    await expect(page).toHaveURL(/billingsettings/);
  });
});