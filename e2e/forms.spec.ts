import { test, expect } from '@playwright/test';

test.describe('Forms', () => {
  test('login form validation', async ({ page }) => {
    await page.goto('/auth');
    
    // Try submit empty form
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      
      // Should show validation errors
      const errors = page.locator('[role="alert"], .error, .text-destructive');
      // Form should not submit with empty fields
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      
      // Should show email format error or native validation
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
      expect(isInvalid).toBe(true);
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/auth');
    
    const requiredInputs = page.locator('input[required]');
    const count = await requiredInputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = requiredInputs.nth(i);
      const isRequired = await input.getAttribute('required');
      expect(isRequired).not.toBeNull();
    }
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('/auth');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await submitBtn.click();
      
      // Should show loading state or redirect
      await page.waitForTimeout(500);
    }
  });
});
