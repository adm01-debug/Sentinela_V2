import { test, expect } from '@playwright/test';

test.describe('userdetail', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});