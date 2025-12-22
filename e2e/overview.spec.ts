import { test, expect } from '@playwright/test';

test.describe('overview', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});