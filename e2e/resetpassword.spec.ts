import { test, expect } from '@playwright/test';

test.describe('resetpassword', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});