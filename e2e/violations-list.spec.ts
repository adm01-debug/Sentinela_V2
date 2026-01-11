import { test, expect } from '@playwright/test';
test.describe('Violations', () => {
  test('should display violations', async ({ page }) => { await page.goto('/violations'); await expect(page.getByTestId('violations-list')).toBeVisible(); });
  test('should filter by severity', async ({ page }) => { await page.goto('/violations'); await page.getByRole('combobox', { name: 'Severity' }).selectOption('critical'); await expect(page.getByTestId('violation-item')).toHaveCount(3); });
});