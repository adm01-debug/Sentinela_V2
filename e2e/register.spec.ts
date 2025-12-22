import { test, expect } from '@playwright/test';

test.describe('register', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});