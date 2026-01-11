import { test, expect } from '@playwright/test';
test.describe('Create Employee', () => {
  test('should create new employee', async ({ page }) => { await page.goto('/employees'); await page.getByRole('button', { name: 'Add Employee' }).click(); await page.getByLabel('Name').fill('Test Employee'); await page.getByLabel('Email').fill('test@example.com'); await page.getByLabel('Department').selectOption('Engineering'); await page.getByRole('button', { name: 'Save' }).click(); await expect(page.getByText('Employee created')).toBeVisible(); });
});