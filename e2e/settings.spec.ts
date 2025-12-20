import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /configura/i })).toBeVisible();
  });

  test('should have settings tabs or sections', async ({ page }) => {
    const hasTabs = await page.locator('[role="tablist"]').count() > 0;
    const hasSections = await page.locator('section, [data-testid="settings-section"]').count() > 0;
    expect(hasTabs || hasSections).toBeTruthy();
  });

  test('should be able to navigate settings', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(300);
    }
  });
});
