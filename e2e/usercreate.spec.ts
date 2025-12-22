import { test, expect } from '@playwright/test';

test.describe('usercreate', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});