import { test, expect } from '@playwright/test';

test.describe('useredit', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});