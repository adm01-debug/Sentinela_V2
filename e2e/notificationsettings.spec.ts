import { test, expect } from '@playwright/test';

test.describe('notificationsettings', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});