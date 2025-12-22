import { test, expect } from '@playwright/test';

test.describe('geofencecreate', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/geofencecreate');
    await expect(page).toHaveURL(/geofencecreate/);
  });
});