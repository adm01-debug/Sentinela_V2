import { test, expect } from '@playwright/test';

test.describe('violationrulecreate', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});