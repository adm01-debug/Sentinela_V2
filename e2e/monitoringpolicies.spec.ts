import { test, expect } from '@playwright/test';

test.describe('monitoringpolicies', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});