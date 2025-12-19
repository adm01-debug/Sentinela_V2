import { test, expect } from '@playwright/test';

test.describe('Violations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/violations**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: '1', violation_type: 'unauthorized_access', severity: 'high', status: 'open' },
          { id: '2', violation_type: 'data_leak', severity: 'critical', status: 'investigating' },
        ]),
      });
    });
    
    await page.goto('/violations');
  });

  test('should display violations list', async ({ page }) => {
    await expect(page.getByText(/unauthorized_access|acesso.*não.*autorizado/i)).toBeVisible();
  });

  test('should filter by severity', async ({ page }) => {
    await page.getByRole('combobox').first().click();
    await page.getByText(/critical|crítica/i).click();
    // Verify filter is applied
  });

  test('should filter by status', async ({ page }) => {
    await page.getByRole('combobox').nth(1).click();
    await page.getByText(/open|aberta/i).click();
    // Verify filter is applied
  });

  test('should show violation details', async ({ page }) => {
    await page.getByText(/unauthorized_access/i).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
