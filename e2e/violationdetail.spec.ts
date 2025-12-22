import { test, expect } from '@playwright/test';

test.describe('violationdetail', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});