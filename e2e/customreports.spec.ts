import { test, expect } from '@playwright/test';

test.describe('customreports', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/customreports');
    await expect(page).toHaveURL(/customreports/);
  });
});