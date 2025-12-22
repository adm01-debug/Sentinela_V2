import { test, expect } from '@playwright/test';

test.describe('internetaccess', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});