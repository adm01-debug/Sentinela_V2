import { test, expect } from '@playwright/test';

test.describe('Forgot Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('should display forgot password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recuperar senha/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();
  });

  test('should send reset email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /enviar/i }).click();
    await expect(page.getByText(/email enviado/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalidemail');
    await page.getByRole('button', { name: /enviar/i }).click();
    await expect(page.getByText(/email inválido/i)).toBeVisible();
  });

  test('should navigate back to login', async ({ page }) => {
    await page.getByRole('link', { name: /voltar/i }).click();
    await expect(page).toHaveURL(/login/);
  });
});
