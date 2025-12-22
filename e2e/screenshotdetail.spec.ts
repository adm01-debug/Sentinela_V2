import { test, expect } from '@playwright/test';

test.describe('screenshotdetail', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});