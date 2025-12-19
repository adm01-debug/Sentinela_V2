import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should display login form', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Sentinela/);

    // Check login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click login without filling form
    await page.getByRole('button', { name: /entrar/i }).click();

    // Expect validation errors
    await expect(page.getByText(/email.*obrigatório/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/senha/i).fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /entrar/i }).click();

    // Wait for error message
    await expect(page.getByText(/credenciais inválidas|erro/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to sign up', async ({ page }) => {
    // Click sign up link
    await page.getByRole('link', { name: /criar conta|cadastrar/i }).click();

    // Check sign up form is visible
    await expect(page.getByRole('button', { name: /cadastrar|criar/i })).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/senha/i);
    
    // Initially password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button if exists
    const toggleButton = page.getByRole('button', { name: /mostrar senha/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});

test.describe('Authentication - Protected Routes', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/');

    // Should redirect to auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect to login when accessing employees page', async ({ page }) => {
    await page.goto('/employees');
    await expect(page).toHaveURL(/\/auth/);
  });
});
