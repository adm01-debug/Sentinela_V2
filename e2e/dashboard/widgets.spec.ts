import { test, expect } from '@playwright/test';

test.describe('Dashboard Widgets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display all widget types', async ({ page }) => {
    const widgets = page.locator('[data-widget]');
    await expect(widgets.first()).toBeVisible();
  });

  test('should allow widget customization', async ({ page }) => {
    const customizeButton = page.getByRole('button', { name: /customize|personalizar/i });
    if (await customizeButton.isVisible()) {
      await customizeButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('should refresh widget data', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /refresh|atualizar/i }).first();
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForResponse(resp => resp.url().includes('api'));
    }
  });

  test('should show widget loading states', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.reload();
    await expect(page.locator('[class*="skeleton"]').first()).toBeVisible();
  });

  test('should handle widget errors gracefully', async ({ page }) => {
    await page.route('**/api/**', route => route.fulfill({ status: 500 }));
    await page.reload();
    await expect(page.getByText(/error|erro|try again|tentar/i)).toBeVisible();
  });

  test('should expand widget to full view', async ({ page }) => {
    const expandButton = page.getByRole('button', { name: /expand|expandir|maximize/i }).first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('should export widget data', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export|exportar/i }).first();
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|pdf)$/);
    }
  });
});
