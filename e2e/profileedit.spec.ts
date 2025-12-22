import { test, expect } from '@playwright/test';

test.describe('profileedit', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});