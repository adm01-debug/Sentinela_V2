import { test, expect } from '@playwright/test';

test.describe('employeeexport', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/employeeexport');
    await expect(page).toHaveURL(/employeeexport/);
  });
});