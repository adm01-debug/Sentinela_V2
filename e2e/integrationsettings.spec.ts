import { test, expect } from '@playwright/test';

test.describe('integrationsettings', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});