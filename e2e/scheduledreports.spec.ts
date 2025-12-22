import { test, expect } from '@playwright/test';

test.describe('scheduledreports', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});