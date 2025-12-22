import { Page } from '@playwright/test';

export async function login(page: Page, email = 'test@test.com', password = 'password123') {
  await page.goto('/login');
  await page.fill('[name=email]', email);
  await page.fill('[name=password]', password);
  await page.click('button[type=submit]');
  await page.waitForURL('/dashboard');
}

export async function logout(page: Page) {
  await page.click('[data-testid=user-menu]');
  await page.click('[data-testid=logout]');
  await page.waitForURL('/login');
}