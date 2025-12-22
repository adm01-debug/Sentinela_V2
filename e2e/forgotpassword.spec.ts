import { test, expect } from '@playwright/test';

test.describe('forgotpassword', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/forgotpassword');
    await expect(page).toHaveURL(/forgotpassword/);
  });
});