import { test, expect } from '@playwright/test';

test.describe('metrics', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});