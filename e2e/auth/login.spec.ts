import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('validpassword123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.getByRole('link', { name: /esqueci minha senha/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalidemail');
    await page.getByLabel(/password/i).click();
    await expect(page.getByText(/email inválido/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/campo obrigatório/i)).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: /mostrar senha/i }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should remember user preference', async ({ page }) => {
    await page.getByLabel(/lembrar-me/i).check();
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('validpassword123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.evaluate(() => localStorage.getItem('rememberMe'))).toBeTruthy();
  });
});
