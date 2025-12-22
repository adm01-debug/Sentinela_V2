import { test, expect } from '@playwright/test';

test.describe('reportschedule', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});