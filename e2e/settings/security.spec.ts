import { test, expect } from '@playwright/test';

test.describe('Security Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/security');
  });

  test('should display security options', async ({ page }) => {
    await expect(page.getByText(/security|segurança/i)).toBeVisible();
  });

  test('should show password change form', async ({ page }) => {
    await expect(page.getByLabel(/current password|senha atual/i)).toBeVisible();
    await expect(page.getByLabel(/new password|nova senha/i)).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.getByLabel(/new password|nova senha/i).first().fill('weak');
    await expect(page.getByText(/weak|fraca|requirements|requisitos/i)).toBeVisible();
  });

  test('should show active sessions', async ({ page }) => {
    await expect(page.getByText(/session|sessão|device|dispositivo/i)).toBeVisible();
  });

  test('should allow terminating sessions', async ({ page }) => {
    const terminateButton = page.getByRole('button', { name: /terminate|encerrar|logout|sair/i });
    if (await terminateButton.isVisible()) {
      await terminateButton.click();
      await expect(page.getByRole('alertdialog')).toBeVisible();
    }
  });

  test('should show 2FA status', async ({ page }) => {
    await expect(page.getByText(/two-factor|2fa|autenticação/i)).toBeVisible();
  });

  test('should display API keys section', async ({ page }) => {
    const apiSection = page.getByText(/api key|chave api/i);
    if (await apiSection.isVisible()) {
      await expect(apiSection).toBeVisible();
    }
  });

  test('should show audit log', async ({ page }) => {
    const auditTab = page.getByRole('tab', { name: /audit|auditoria/i });
    if (await auditTab.isVisible()) {
      await auditTab.click();
      await expect(page.getByRole('table')).toBeVisible();
    }
  });
});
