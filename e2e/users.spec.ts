import { test, expect } from '@playwright/test';

test.describe('users', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});