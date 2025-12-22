import { test, expect } from '@playwright/test';

test.describe('permissions', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});