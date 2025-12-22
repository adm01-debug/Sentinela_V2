import { test, expect } from '@playwright/test';

test.describe('employeeedit', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/employeeedit');
    await expect(page).toHaveURL(/employeeedit/);
  });
});