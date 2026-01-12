import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /login|entrar/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'invalid@test.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/erro|invalid/i)).toBeVisible();
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@sentinela.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });
});
