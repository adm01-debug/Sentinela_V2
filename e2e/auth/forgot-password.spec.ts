import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('should display forgot password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /forgot|esqueci|reset|recuperar/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid');
    await page.getByRole('button', { name: /send|enviar|reset/i }).click();
    await expect(page.getByText(/valid|válido/i)).toBeVisible();
  });

  test('should show success message on valid submit', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /send|enviar|reset/i }).click();
    await expect(page.getByText(/sent|enviado|check|verifique/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate back to login', async ({ page }) => {
    await page.getByRole('link', { name: /login|voltar|back/i }).click();
    await expect(page).toHaveURL(/login/);
  });
});
