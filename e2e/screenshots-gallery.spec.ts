import { test, expect } from '@playwright/test';
test.describe('Screenshots', () => {
  test('should display gallery', async ({ page }) => { await page.goto('/screenshots'); await expect(page.getByTestId('screenshot-gallery')).toBeVisible(); });
  test('should open lightbox', async ({ page }) => { await page.goto('/screenshots'); await page.getByRole('img').first().click(); await expect(page.getByTestId('lightbox')).toBeVisible(); });
});