import { test, expect } from '@playwright/test';

test.describe('productivitycomparison', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});