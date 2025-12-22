import { test, expect } from '@playwright/test';

test.describe('geofencemap', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});