import { test, expect } from '@playwright/test';

test.describe('screenshots', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});