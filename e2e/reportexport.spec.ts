import { test, expect } from '@playwright/test';

test.describe('reportexport', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});