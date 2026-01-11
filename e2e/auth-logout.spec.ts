import { test, expect } from '@playwright/test';
test.describe('Logout', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/login'); await page.getByLabel('Email').fill('admin@sentinela.com'); await page.getByLabel('Password').fill('admin123'); await page.getByRole('button', { name: 'Login' }).click(); await page.waitForURL('/dashboard'); });
  test('should logout user', async ({ page }) => { await page.getByTestId('user-menu').click(); await page.getByText('Logout').click(); await expect(page).toHaveURL('/login'); });
});