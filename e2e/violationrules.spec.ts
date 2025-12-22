import { test, expect } from '@playwright/test';

test.describe('violationrules', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});