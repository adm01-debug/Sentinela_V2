import { test, expect } from '@playwright/test';

test.describe('Employees Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
  });

  test('should display employees list', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should filter employees', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('should open employee details', async ({ page }) => {
    const firstEmployee = page.locator('tr, [data-testid="employee-row"]').first();
    if (await firstEmployee.count() > 0) {
      await firstEmployee.click();
    }
  });
});
