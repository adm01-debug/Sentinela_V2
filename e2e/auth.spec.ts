import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /entrar|login/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /entrar|login/i }).click();
    await expect(page.getByText(/email.*obrigatório|required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.getByRole('button', { name: /entrar|login/i }).click();
    
    await expect(page.getByText(/credenciais.*inválidas|invalid/i)).toBeVisible();
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.getByText(/esqueceu.*senha|forgot.*password/i).click();
    await expect(page).toHaveURL(/forgot|recuperar/);
  });
});
