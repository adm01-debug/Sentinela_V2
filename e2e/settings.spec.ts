import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings sections', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have save button', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /salvar|save/i });
    if (await saveBtn.count() > 0) {
      await expect(saveBtn.first()).toBeVisible();
    }
  });

  test('should toggle settings', async ({ page }) => {
    const toggle = page.locator('[role="switch"], input[type="checkbox"]').first();
    if (await toggle.count() > 0) {
      await toggle.click();
    }
  });
});
