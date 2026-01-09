import { test, expect } from '@playwright/test';

test.describe('Report Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('should display report types', async ({ page }) => {
    await expect(page.getByText(/activity|atividade/i)).toBeVisible();
    await expect(page.getByText(/productivity|produtividade/i)).toBeVisible();
  });

  test('should select report type', async ({ page }) => {
    const reportCard = page.locator('[data-report-type]').first();
    await reportCard.click();
    await expect(page).toHaveURL(/reports\/generate/);
  });

  test('should configure date range', async ({ page }) => {
    await page.goto('/reports/generate');
    const dateRange = page.getByRole('button', { name: /date|data|period|período/i });
    if (await dateRange.isVisible()) {
      await dateRange.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('should select export format', async ({ page }) => {
    await page.goto('/reports/generate');
    const formatSelect = page.getByRole('combobox', { name: /format|formato/i });
    if (await formatSelect.isVisible()) {
      await formatSelect.click();
      await expect(page.getByRole('option', { name: /pdf/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /excel|xlsx/i })).toBeVisible();
    }
  });

  test('should generate and download report', async ({ page }) => {
    await page.goto('/reports/generate');
    await page.getByRole('button', { name: /generate|gerar/i }).click();
    await expect(page.getByText(/generating|gerando|processing/i)).toBeVisible();
  });

  test('should show report history', async ({ page }) => {
    await expect(page.getByText(/history|histórico|recent|recentes/i)).toBeVisible();
  });

  test('should schedule reports', async ({ page }) => {
    const scheduleButton = page.getByRole('button', { name: /schedule|agendar/i });
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});
