import { test, expect } from '@playwright/test';

test.describe('login', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});