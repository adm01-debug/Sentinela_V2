import { test, expect } from '@playwright/test';

test('Auth flow', async ({ page }) => {
  await page.goto('/login');
  expect(await page.title()).toContain('Login');
});