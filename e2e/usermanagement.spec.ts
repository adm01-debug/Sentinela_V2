import { test, expect } from '@playwright/test';

test.describe('usermanagement', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});