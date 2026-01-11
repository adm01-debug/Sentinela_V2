import { test, expect } from '@playwright/test';
test.describe('Activities Filter', () => {
  test('should filter by type', async ({ page }) => { await page.goto('/activities'); await page.getByRole('combobox', { name: 'Type' }).selectOption('login'); await expect(page.getByTestId('activity-item')).toHaveCount(5); });
  test('should filter by employee', async ({ page }) => { await page.goto('/activities'); await page.getByRole('combobox', { name: 'Employee' }).selectOption('John Doe'); });
});