import { test, expect } from '@playwright/test';

test.describe('roleedit', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});