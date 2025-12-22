import { test, expect } from '@playwright/test';

test.describe('ssocallback', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});