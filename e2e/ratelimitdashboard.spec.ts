import { test, expect } from '@playwright/test';

test.describe('ratelimitdashboard', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});