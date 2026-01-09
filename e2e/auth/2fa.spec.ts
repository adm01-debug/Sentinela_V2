import { test, expect } from '@playwright/test';

test.describe('Two Factor Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('2fa-user@test.com');
    await page.getByLabel(/password/i).fill('validpassword123');
    await page.getByRole('button', { name: /entrar/i }).click();
  });

  test('should prompt for 2FA code', async ({ page }) => {
    await expect(page.getByText(/código de verificação/i)).toBeVisible();
    await expect(page.getByLabel(/código/i)).toBeVisible();
  });

  test('should validate 2FA code format', async ({ page }) => {
    await page.getByLabel(/código/i).fill('12345');
    await page.getByRole('button', { name: /verificar/i }).click();
    await expect(page.getByText(/código inválido/i)).toBeVisible();
  });

  test('should login with valid 2FA code', async ({ page }) => {
    await page.getByLabel(/código/i).fill('123456');
    await page.getByRole('button', { name: /verificar/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should allow backup code', async ({ page }) => {
    await page.getByRole('link', { name: /usar código de backup/i }).click();
    await expect(page.getByLabel(/código de backup/i)).toBeVisible();
  });

  test('should resend code', async ({ page }) => {
    await page.getByRole('button', { name: /reenviar código/i }).click();
    await expect(page.getByText(/código reenviado/i)).toBeVisible();
  });
});
