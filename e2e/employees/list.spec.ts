import { test, expect } from '@playwright/test';

test.describe('Employees List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
  });

  test('should display employees table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /nome/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /departamento/i })).toBeVisible();
  });

  test('should search employees', async ({ page }) => {
    await page.getByPlaceholder(/buscar/i).fill('John');
    await expect(page.getByRole('row')).toHaveCount(2); // header + 1 result
  });

  test('should filter by department', async ({ page }) => {
    await page.getByRole('combobox', { name: /departamento/i }).selectOption('TI');
    await expect(page.getByRole('cell', { name: /TI/i })).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    await page.getByRole('combobox', { name: /status/i }).selectOption('active');
    await expect(page.getByRole('cell', { name: /ativo/i })).toBeVisible();
  });

  test('should sort by column', async ({ page }) => {
    await page.getByRole('columnheader', { name: /nome/i }).click();
    await expect(page.getByRole('columnheader', { name: /nome/i })).toHaveAttribute('aria-sort', 'ascending');
  });

  test('should paginate results', async ({ page }) => {
    await page.getByRole('button', { name: /próxima/i }).click();
    await expect(page.getByText(/página 2/i)).toBeVisible();
  });

  test('should select multiple employees', async ({ page }) => {
    await page.getByRole('checkbox').first().check();
    await page.getByRole('checkbox').nth(1).check();
    await expect(page.getByText(/2 selecionados/i)).toBeVisible();
  });
});
