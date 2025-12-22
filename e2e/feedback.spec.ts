import { test, expect } from '@playwright/test';

test.describe('feedback', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/feedback');
    await expect(page).toHaveURL(/feedback/);
  });
});