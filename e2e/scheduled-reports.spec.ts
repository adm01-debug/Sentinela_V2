import { test, expect } from '@playwright/test';

test.describe('Scheduled Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scheduled-reports');
  });

  test('should display reports page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /relat.*agendados/i })).toBeVisible();
  });

  test('should have create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /novo/i })).toBeVisible();
  });

  test('should open create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /novo/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should have report type selector in dialog', async ({ page }) => {
    await page.getByRole('button', { name: /novo/i }).click();
    await expect(page.getByText(/tipo/i)).toBeVisible();
  });

  test('should have format selector in dialog', async ({ page }) => {
    await page.getByRole('button', { name: /novo/i }).click();
    await expect(page.getByText(/formato/i)).toBeVisible();
  });
});
