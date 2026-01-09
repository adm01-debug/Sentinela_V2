import { test, expect } from '@playwright/test';

test.describe('Violations List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/violations');
  });

  test('should display violations table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should filter by severity', async ({ page }) => {
    const severityFilter = page.getByRole('combobox', { name: /severity|gravidade/i });
    if (await severityFilter.isVisible()) {
      await severityFilter.click();
      await page.getByRole('option', { name: /high|alta|critical|crítica/i }).click();
    }
  });

  test('should filter by type', async ({ page }) => {
    const typeFilter = page.getByRole('combobox', { name: /type|tipo/i });
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await page.getByRole('option').first().click();
    }
  });

  test('should filter by date range', async ({ page }) => {
    const dateFilter = page.getByRole('button', { name: /date|data/i });
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('should show severity badges', async ({ page }) => {
    await expect(page.locator('[data-severity]').first()).toBeVisible();
  });

  test('should open violation details', async ({ page }) => {
    await page.getByRole('row').nth(1).click();
    await expect(page).toHaveURL(/violations\/[a-z0-9-]+/);
  });
});
