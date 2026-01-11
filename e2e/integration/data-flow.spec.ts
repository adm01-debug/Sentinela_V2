import { test, expect } from '@playwright/test';

test('Data flow', async ({ page }) => {
  await page.goto('/dashboard');
  expect(page.locator('h1')).toBeTruthy();
});