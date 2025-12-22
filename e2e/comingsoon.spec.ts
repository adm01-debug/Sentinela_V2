import { test, expect } from '@playwright/test';

test.describe('comingsoon', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/comingsoon');
    await expect(page).toHaveURL(/comingsoon/);
  });
});