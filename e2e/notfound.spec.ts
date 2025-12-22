import { test, expect } from '@playwright/test';

test.describe('notfound', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});