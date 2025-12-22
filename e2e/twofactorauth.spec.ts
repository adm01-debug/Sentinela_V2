import { test, expect } from '@playwright/test';

test.describe('twofactorauth', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});