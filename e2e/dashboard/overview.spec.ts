import { test, expect } from '@playwright/test';

test.describe('Dashboard Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display main dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard|painel/i })).toBeVisible();
  });

  test('should show statistics cards', async ({ page }) => {
    await expect(page.getByTestId('stat-card').first()).toBeVisible();
  });

  test('should display activity chart', async ({ page }) => {
    const chart = page.locator('[class*="recharts"]').first();
    await expect(chart).toBeVisible();
  });

  test('should show recent activity', async ({ page }) => {
    await expect(page.getByText(/recent|recente|activity|atividade/i)).toBeVisible();
  });

  test('should have navigation sidebar', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should display user menu', async ({ page }) => {
    await expect(page.getByRole('button', { name: /user|usuário|profile|perfil/i })).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
  });

  test('should load data without errors', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/error|erro/i)).not.toBeVisible();
  });

  test('should allow date range selection', async ({ page }) => {
    const dateButton = page.getByRole('button', { name: /date|data|period|período/i });
    if (await dateButton.isVisible()) {
      await dateButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});
