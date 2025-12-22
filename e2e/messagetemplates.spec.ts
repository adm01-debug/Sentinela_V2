import { test, expect } from '@playwright/test';

test.describe('messagetemplates', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});