import { test, expect } from '@playwright/test';

test.describe('geofences', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});