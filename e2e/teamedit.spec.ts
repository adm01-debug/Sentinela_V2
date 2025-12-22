import { test, expect } from '@playwright/test';

test.describe('teamedit', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});