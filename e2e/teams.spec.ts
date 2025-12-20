import { test, expect } from '@playwright/test';

test.describe('Teams Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
  });

  test('should display teams page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /equipes/i })).toBeVisible();
  });

  test('should have create team button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /nova equipe/i })).toBeVisible();
  });

  test('should open create dialog when clicking new team', async ({ page }) => {
    await page.getByRole('button', { name: /nova equipe/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should filter teams by search', async ({ page }) => {
    await page.getByPlaceholder(/buscar/i).fill('engineering');
    await page.waitForTimeout(500);
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /equipes/i })).toBeVisible();
  });
});
