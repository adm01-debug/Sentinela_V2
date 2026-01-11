import { test, expect } from '@playwright/test';
test.describe('Edit Employee', () => {
  test('should edit employee', async ({ page }) => { await page.goto('/employees'); await page.getByRole('row').first().getByRole('button', { name: 'Edit' }).click(); await page.getByLabel('Name').fill('Updated Name'); await page.getByRole('button', { name: 'Save' }).click(); await expect(page.getByText('Employee updated')).toBeVisible(); });
});