import { test, expect } from '@playwright/test';

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /cadastro/i })).toBeVisible();
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalidemail');
    await page.getByLabel(/nome/i).click();
    await expect(page.getByText(/email inválido/i)).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.getByLabel(/senha/i).fill('weak');
    await expect(page.getByText(/senha muito fraca/i)).toBeVisible();
  });

  test('should show password confirmation mismatch', async ({ page }) => {
    await page.getByLabel('Senha').fill('StrongPass123!');
    await page.getByLabel(/confirmar senha/i).fill('DifferentPass123!');
    await expect(page.getByText(/senhas não conferem/i)).toBeVisible();
  });

  test('should register successfully', async ({ page }) => {
    await page.getByLabel(/nome/i).fill('Test User');
    await page.getByLabel(/email/i).fill('newuser@test.com');
    await page.getByLabel('Senha').fill('StrongPass123!');
    await page.getByLabel(/confirmar/i).fill('StrongPass123!');
    await page.getByRole('button', { name: /cadastrar/i }).click();
    await expect(page.getByText(/conta criada/i)).toBeVisible();
  });

  test('should navigate to login', async ({ page }) => {
    await page.getByRole('link', { name: /já tenho uma conta/i }).click();
    await expect(page).toHaveURL(/login/);
  });
});
