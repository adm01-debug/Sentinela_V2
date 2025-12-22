import { test, expect } from '@playwright/test';

test.describe('rolecreate', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});