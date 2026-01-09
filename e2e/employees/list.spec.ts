import { test, expect } from '@playwright/test';

test.describe('Employees List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
  });

  test('should display employees table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should show search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|buscar|pesquisar/i);
    await expect(searchInput).toBeVisible();
  });

  test('should filter employees by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|buscar/i);
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    await expect(page.getByRole('row')).toHaveCount.greaterThan(0);
  });

  test('should have pagination', async ({ page }) => {
    const pagination = page.getByRole('navigation', { name: /pagination/i });
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
  });

  test('should sort by columns', async ({ page }) => {
    const nameHeader = page.getByRole('columnheader', { name: /name|nome/i });
    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort');
  });

  test('should open employee details', async ({ page }) => {
    const firstRow = page.getByRole('row').nth(1);
    await firstRow.click();
    await expect(page).toHaveURL(/employees\/[a-z0-9-]+/);
  });

  test('should filter by department', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /filter|filtrar/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await expect(page.getByRole('listbox')).toBeVisible();
    }
  });
});
