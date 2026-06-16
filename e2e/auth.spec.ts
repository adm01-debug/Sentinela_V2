import { test, expect } from '@playwright/test';

test('should show login page', async ({ page }) => {
  await page.goto('/auth');
  await expect(page).toHaveURL(/\/auth/);
  await expect(page.locator('h1')).toContainText(/Sentinela|SecureWatch|Entrar/i);
});

test('should show validation error on empty login', async ({ page }) => {
  await page.goto('/auth');
  await page.click('button[type="submit"]');
  // Check for some common error text or indicator
  const error = page.locator('text=/campo obrigatório|inválid|preencha/i');
  await expect(error.first()).toBeVisible();
});
