import { test, expect } from '@playwright/test';

test.describe('reportbuilder', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});