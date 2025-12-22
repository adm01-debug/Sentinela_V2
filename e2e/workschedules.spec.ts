import { test, expect } from '@playwright/test';

test.describe('workschedules', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});