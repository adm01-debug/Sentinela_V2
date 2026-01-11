import { test, expect } from '@playwright/test';
test.describe('Keyboard Accessibility', () => {
  test('should navigate with tab', async ({ page }) => { await page.goto('/login'); await page.keyboard.press('Tab'); await expect(page.getByLabel('Email')).toBeFocused(); await page.keyboard.press('Tab'); await expect(page.getByLabel('Password')).toBeFocused(); });
  test('should submit form with enter', async ({ page }) => { await page.goto('/login'); await page.getByLabel('Email').fill('test@test.com'); await page.getByLabel('Password').fill('password'); await page.keyboard.press('Enter'); });
});