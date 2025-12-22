import { test, expect } from '@playwright/test';

test.describe('teamsettings', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});