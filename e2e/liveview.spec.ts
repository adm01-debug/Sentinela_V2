import { test, expect } from '@playwright/test';

test.describe('liveview', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});