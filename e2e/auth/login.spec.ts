import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login|entrar/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login|entrar/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password|senha/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login|entrar/i }).click();
    await expect(page.getByText(/invalid|inválido|error|erro/i)).toBeVisible();
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.getByRole('link', { name: /forgot|esqueci/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should navigate to register', async ({ page }) => {
    await page.getByRole('link', { name: /register|cadastr/i }).click();
    await expect(page).toHaveURL(/register/);
  });

  test('should have accessible form', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password|senha/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /login|entrar/i }).click();
    await expect(page.getByText(/required|obrigatório/i)).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password|senha/i);
    const toggleButton = page.getByRole('button', { name: /show|mostrar|eye/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
