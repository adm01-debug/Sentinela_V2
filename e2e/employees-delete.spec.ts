import { test, expect } from '@playwright/test';
test.describe('Delete Employee', () => {
  test('should delete employee', async ({ page }) => { await page.goto('/employees'); await page.getByRole('row').first().getByRole('button', { name: 'Delete' }).click(); await page.getByRole('button', { name: 'Confirm' }).click(); await expect(page.getByText('Employee deleted')).toBeVisible(); });
});