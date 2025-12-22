import { test, expect } from '@playwright/test';

test.describe('employeeimport', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/employeeimport');
    await expect(page).toHaveURL(/employeeimport/);
  });
});