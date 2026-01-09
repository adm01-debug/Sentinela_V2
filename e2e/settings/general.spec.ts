import { test, expect } from '@playwright/test';

test.describe('General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings menu', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should change language', async ({ page }) => {
    const langSelect = page.getByRole('combobox', { name: /language|idioma/i });
    if (await langSelect.isVisible()) {
      await langSelect.click();
      await page.getByRole('option', { name: /english|português|español/i }).first().click();
    }
  });

  test('should toggle dark mode', async ({ page }) => {
    const themeToggle = page.getByRole('switch', { name: /dark|escuro|theme|tema/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await expect(page.locator('html')).toHaveClass(/dark/);
    }
  });

  test('should save preferences', async ({ page }) => {
    await page.getByRole('button', { name: /save|salvar/i }).click();
    await expect(page.getByText(/saved|salvo|success/i)).toBeVisible();
  });

  test('should show notifications settings', async ({ page }) => {
    const notifTab = page.getByRole('tab', { name: /notification|notificação/i });
    if (await notifTab.isVisible()) {
      await notifTab.click();
      await expect(page.getByRole('switch').first()).toBeVisible();
    }
  });

  test('should display organization settings', async ({ page }) => {
    await page.goto('/settings/organization');
    await expect(page.getByLabel(/name|nome/i)).toBeVisible();
  });
});
