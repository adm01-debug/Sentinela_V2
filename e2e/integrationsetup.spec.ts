import { test, expect } from '@playwright/test';

test.describe('integrationsetup', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});