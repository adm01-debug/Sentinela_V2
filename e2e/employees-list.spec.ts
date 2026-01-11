import { test, expect } from '@playwright/test';
test.describe('Employees List', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/employees'); });
  test('should display employee table', async ({ page }) => { await expect(page.getByRole('table')).toBeVisible(); });
  test('should filter employees', async ({ page }) => { await page.getByPlaceholder('Search').fill('John'); await expect(page.getByRole('row')).toHaveCount(2); });
  test('should open employee details', async ({ page }) => { await page.getByRole('row').first().click(); await expect(page.getByTestId('employee-details')).toBeVisible(); });
});