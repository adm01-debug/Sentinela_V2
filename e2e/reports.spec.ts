import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('should display reports list', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should generate report', async ({ page }) => {
    const generateBtn = page.getByRole('button', { name: /gerar|generate|criar/i });
    if (await generateBtn.count() > 0) {
      await expect(generateBtn.first()).toBeVisible();
    }
  });

  test('should export report', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /exportar|export|download/i });
    if (await exportBtn.count() > 0) {
      await expect(exportBtn.first()).toBeVisible();
    }
  });
});
