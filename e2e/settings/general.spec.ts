import { test, expect } from '@playwright/test';

test.describe('General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings form', async ({ page }) => {
    await expect(page.getByLabel(/nome da empresa/i)).toBeVisible();
    await expect(page.getByLabel(/idioma/i)).toBeVisible();
    await expect(page.getByLabel(/fuso horário/i)).toBeVisible();
  });

  test('should update company name', async ({ page }) => {
    await page.getByLabel(/nome da empresa/i).fill('New Company Name');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/salvo/i)).toBeVisible();
  });

  test('should change language', async ({ page }) => {
    await page.getByLabel(/idioma/i).selectOption('en-US');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should change timezone', async ({ page }) => {
    await page.getByLabel(/fuso horário/i).selectOption('America/New_York');
    await page.getByRole('button', { name: /salvar/i }).click();
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.getByLabel(/modo escuro/i).check();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should configure notifications', async ({ page }) => {
    await page.getByRole('tab', { name: /notificações/i }).click();
    await page.getByLabel(/email/i).check();
    await page.getByRole('button', { name: /salvar/i }).click();
  });
});
