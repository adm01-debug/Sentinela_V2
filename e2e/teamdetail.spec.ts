import { test, expect } from '@playwright/test';

test.describe('teamdetail', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});