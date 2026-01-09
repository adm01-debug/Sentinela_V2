import { test, expect } from '@playwright/test';

test.describe('Violation Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/violations/1');
  });

  test('should display violation details', async ({ page }) => {
    await expect(page.getByTestId('violation-type')).toBeVisible();
    await expect(page.getByTestId('violation-severity')).toBeVisible();
    await expect(page.getByTestId('violation-description')).toBeVisible();
  });

  test('should display employee info', async ({ page }) => {
    await expect(page.getByTestId('employee-name')).toBeVisible();
  });

  test('should add comment', async ({ page }) => {
    await page.getByLabel(/comentário/i).fill('Test comment');
    await page.getByRole('button', { name: /adicionar/i }).click();
    await expect(page.getByText('Test comment')).toBeVisible();
  });

  test('should change status', async ({ page }) => {
    await page.getByRole('button', { name: /marcar como revisado/i }).click();
    await expect(page.getByTestId('status-badge')).toHaveText(/revisado/i);
  });

  test('should view screenshot', async ({ page }) => {
    await page.getByRole('button', { name: /ver screenshot/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
