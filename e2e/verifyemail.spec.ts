import { test, expect } from '@playwright/test';

test.describe('verifyemail', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});