import { test, expect } from '@playwright/test';

test.describe('mobilemonitoring', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});