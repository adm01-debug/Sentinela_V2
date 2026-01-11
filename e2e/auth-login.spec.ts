import { test, expect } from '@playwright/test';
test.describe('Login', () => {
  test('should display login form', async ({ page }) => { await page.goto('/login'); await expect(page.getByLabel('Email')).toBeVisible(); await expect(page.getByLabel('Password')).toBeVisible(); });
  test('should show error on invalid credentials', async ({ page }) => { await page.goto('/login'); await page.getByLabel('Email').fill('invalid@test.com'); await page.getByLabel('Password').fill('wrongpassword'); await page.getByRole('button', { name: 'Login' }).click(); await expect(page.getByText(/invalid/i)).toBeVisible(); });
  test('should redirect to dashboard on success', async ({ page }) => { await page.goto('/login'); await page.getByLabel('Email').fill('admin@sentinela.com'); await page.getByLabel('Password').fill('admin123'); await page.getByRole('button', { name: 'Login' }).click(); await expect(page).toHaveURL('/dashboard'); });
});