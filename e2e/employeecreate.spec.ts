import { test, expect } from '@playwright/test';

test.describe('employeecreate', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/employeecreate');
    await expect(page).toHaveURL(/employeecreate/);
  });
});