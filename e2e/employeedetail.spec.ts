import { test, expect } from '@playwright/test';

test.describe('employeedetail', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/employeedetail');
    await expect(page).toHaveURL(/employeedetail/);
  });
});