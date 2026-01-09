import { test, expect } from '@playwright/test';

test.describe('Employee Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
    await page.getByRole('row').nth(1).click();
  });

  test('should display employee info', async ({ page }) => {
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should show activity timeline', async ({ page }) => {
    await expect(page.getByText(/activity|atividade|timeline/i)).toBeVisible();
  });

  test('should display violations history', async ({ page }) => {
    const violationsTab = page.getByRole('tab', { name: /violation|violação/i });
    if (await violationsTab.isVisible()) {
      await violationsTab.click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
    }
  });

  test('should show productivity metrics', async ({ page }) => {
    const productivityTab = page.getByRole('tab', { name: /productivity|produtividade/i });
    if (await productivityTab.isVisible()) {
      await productivityTab.click();
      await expect(page.locator('[class*="chart"]')).toBeVisible();
    }
  });

  test('should allow editing from detail view', async ({ page }) => {
    await page.getByRole('button', { name: /edit|editar/i }).click();
    await expect(page.getByRole('form')).toBeVisible();
  });

  test('should navigate back to list', async ({ page }) => {
    await page.getByRole('button', { name: /back|voltar/i }).click();
    await expect(page).toHaveURL(/employees$/);
  });
});
