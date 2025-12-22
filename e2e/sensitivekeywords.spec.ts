import { test, expect } from '@playwright/test';

test.describe('sensitivekeywords', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});