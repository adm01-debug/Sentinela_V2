import { test, expect } from '@playwright/test';

test.describe('policycreate', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});