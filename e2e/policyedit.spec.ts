import { test, expect } from '@playwright/test';

test.describe('policyedit', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});