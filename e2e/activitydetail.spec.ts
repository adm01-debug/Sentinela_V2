import { test, expect } from '@playwright/test';

test.describe('activitydetail', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/activitydetail');
    await expect(page).toHaveURL(/activitydetail/);
  });
});