import { test, expect } from '@playwright/test';

test.describe('Teams Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
  });

  test('should display teams page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /equipes/i })).toBeVisible();
  });

  test('should have create team button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /nova equipe/i })).toBeVisible();
  });

  test('should open create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nova equipe/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/nome/i)).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
  });

  test('should have status filter', async ({ page }) => {
    await expect(page.locator('[role="combobox"]').first()).toBeVisible();
  });

  test('should show stats cards', async ({ page }) => {
    await expect(page.getByText(/total equipes/i)).toBeVisible();
  });
});
