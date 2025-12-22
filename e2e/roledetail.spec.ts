import { test, expect } from '@playwright/test';

test.describe('roledetail', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});