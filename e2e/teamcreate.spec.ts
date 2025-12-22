import { test, expect } from '@playwright/test';

test.describe('teamcreate', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});