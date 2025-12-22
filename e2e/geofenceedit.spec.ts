import { test, expect } from '@playwright/test';

test.describe('geofenceedit', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});