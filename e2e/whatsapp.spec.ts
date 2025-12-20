import { test, expect } from '@playwright/test';

test.describe('WhatsApp Integration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/whatsapp-integration');
  });

  test('should display whatsapp page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /whatsapp/i })).toBeVisible();
  });

  test('should have tabs', async ({ page }) => {
    await expect(page.locator('[role="tablist"]')).toBeVisible();
  });

  test('should switch tabs', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    if (count > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(300);
    }
  });

  test('should have stats cards', async ({ page }) => {
    const cards = page.locator('.card').first();
    await expect(cards).toBeVisible();
  });
});
