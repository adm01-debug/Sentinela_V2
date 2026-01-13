import { test, expect } from '@playwright/test';

test.describe('Complete Auth Flow', () => {
  test('should complete login flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete registration flow', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="email"]', 'new@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/verify-email');
  });

  test('should complete logout flow', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout"]');
    await expect(page).toHaveURL('/login');
  });

  test('should complete password reset flow', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should complete MFA setup', async ({ page }) => {
    await page.goto('/settings/security');
    await page.click('[data-testid="enable-mfa"]');
    await expect(page.locator('.mfa-qr-code')).toBeVisible();
  });
});
