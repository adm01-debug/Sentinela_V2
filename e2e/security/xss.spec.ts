import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should prevent XSS attacks', async ({ page }) => {
    await page.goto('/search?q=<script>alert("xss")</script>');
    const alerts = await page.evaluate(() => window.alert);
    // Should not have triggered any alert
    await expect(page.locator('script')).toHaveCount(0);
  });

  test('should have CSRF protection', async ({ page }) => {
    await page.goto('/login');
    const csrfToken = await page.locator('input[name="csrf_token"]').getAttribute('value');
    expect(csrfToken).toBeTruthy();
  });

  test('should prevent unauthorized access', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });

  test('should rate limit login attempts', async ({ page }) => {
    await page.goto('/login');
    for (let i = 0; i < 6; i++) {
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
    }
    await expect(page.locator('.rate-limit-error')).toBeVisible();
  });

  test('should secure session handling', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(true);
  });
});
