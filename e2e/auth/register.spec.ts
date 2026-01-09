import { test, expect } from '@playwright/test';

test.describe('Register Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /register|cadastr/i })).toBeVisible();
    await expect(page.getByLabel(/name|nome/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|senha/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /register|cadastr/i }).click();
    await expect(page.getByText(/valid|válido/i)).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.getByLabel(/password|senha/i).first().fill('weak');
    await expect(page.getByText(/weak|fraca/i)).toBeVisible();
    await page.getByLabel(/password|senha/i).first().fill('StrongP@ssw0rd!');
    await expect(page.getByText(/strong|forte/i)).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.getByLabel(/password|senha/i).first().fill('Password123!');
    const confirmInput = page.getByLabel(/confirm|confirma/i);
    if (await confirmInput.isVisible()) {
      await confirmInput.fill('DifferentPassword');
      await page.getByRole('button', { name: /register|cadastr/i }).click();
      await expect(page.getByText(/match|coincidem/i)).toBeVisible();
    }
  });

  test('should navigate to login', async ({ page }) => {
    await page.getByRole('link', { name: /login|entrar/i }).click();
    await expect(page).toHaveURL(/login/);
  });

  test('should accept terms checkbox if present', async ({ page }) => {
    const terms = page.getByLabel(/terms|termos/i);
    if (await terms.isVisible()) {
      await terms.check();
      await expect(terms).toBeChecked();
    }
  });
});
