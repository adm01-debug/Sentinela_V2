import { test, expect } from '@playwright/test';

test.describe('activities', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/activities');
    await expect(page).toHaveURL(/activities/);
  });
});