import { test, expect } from '@playwright/test';

test.describe('Report Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('should display report types', async ({ page }) => {
    await expect(page.getByText(/produtividade/i)).toBeVisible();
    await expect(page.getByText(/violações/i)).toBeVisible();
    await expect(page.getByText(/atividades/i)).toBeVisible();
  });

  test('should generate productivity report', async ({ page }) => {
    await page.getByRole('button', { name: /produtividade/i }).click();
    await page.getByRole('button', { name: /gerar/i }).click();
    await expect(page.getByText(/relatório gerado/i)).toBeVisible();
  });

  test('should customize date range', async ({ page }) => {
    await page.getByRole('button', { name: /período/i }).click();
    await page.getByLabel(/de/i).fill('2024-01-01');
    await page.getByLabel(/até/i).fill('2024-01-31');
  });

  test('should select employees', async ({ page }) => {
    await page.getByRole('button', { name: /funcionários/i }).click();
    await page.getByRole('checkbox').first().check();
    await page.getByRole('button', { name: /aplicar/i }).click();
  });

  test('should download report', async ({ page }) => {
    await page.goto('/reports/1');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /baixar/i }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('report');
  });

  test('should schedule report', async ({ page }) => {
    await page.getByRole('button', { name: /agendar/i }).click();
    await page.getByLabel(/frequência/i).selectOption('weekly');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/agendado/i)).toBeVisible();
  });

  test('should share report', async ({ page }) => {
    await page.goto('/reports/1');
    await page.getByRole('button', { name: /compartilhar/i }).click();
    await page.getByLabel(/email/i).fill('share@test.com');
    await page.getByRole('button', { name: /enviar/i }).click();
    await expect(page.getByText(/enviado/i)).toBeVisible();
  });
});
