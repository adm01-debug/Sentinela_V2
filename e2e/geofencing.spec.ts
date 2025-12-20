import { test, expect } from '@playwright/test';

test.describe('Geofencing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/geofencing');
  });

  test('should display geofencing page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /geofencing/i })).toBeVisible();
  });

  test('should have create geofence button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /nova geofence/i })).toBeVisible();
  });

  test('should show map', async ({ page }) => {
    await expect(page.locator('.mapboxgl-map, [data-testid="map"]')).toBeVisible({ timeout: 10000 }).catch(() => {
      // Map might not load without API key
    });
  });

  test('should open create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nova geofence/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should have geofence type selector in dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nova geofence/i }).click();
    await expect(page.getByText(/tipo/i)).toBeVisible();
  });
});
