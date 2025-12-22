import { test, expect } from '@playwright/test';

test.describe('logout', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});