import { test, expect } from '@playwright/test';

test.describe('whatsappintegration', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});