import { test, expect } from '@playwright/test';

test.describe('Employees', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
  });

  test('should display employee list', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should filter employees by search', async ({ page }) => {
    await page.fill('[placeholder*="Buscar"]', 'João');
    await expect(page.getByText('João')).toBeVisible();
  });

  test('should open employee details', async ({ page }) => {
    await page.click('table tbody tr:first-child');
    await expect(page.getByTestId('employee-details')).toBeVisible();
  });
});
