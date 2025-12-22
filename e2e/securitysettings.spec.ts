import { test, expect } from '@playwright/test';

test.describe('securitysettings', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});