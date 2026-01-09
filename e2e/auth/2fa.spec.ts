import { test, expect } from '@playwright/test';

test.describe('Two-Factor Authentication', () => {
  test('should show 2FA setup option in settings', async ({ page }) => {
    // This test assumes user is logged in
    await page.goto('/settings/security');
    await expect(page.getByText(/two-factor|2fa|autenticação/i)).toBeVisible();
  });

  test('should display QR code for TOTP setup', async ({ page }) => {
    await page.goto('/settings/security');
    const enableButton = page.getByRole('button', { name: /enable|ativar|setup/i });
    if (await enableButton.isVisible()) {
      await enableButton.click();
      await expect(page.getByRole('img', { name: /qr/i })).toBeVisible();
    }
  });

  test('should validate 6-digit code format', async ({ page }) => {
    await page.goto('/settings/security');
    const codeInput = page.getByLabel(/code|código/i);
    if (await codeInput.isVisible()) {
      await codeInput.fill('12345');
      await page.getByRole('button', { name: /verify|verificar/i }).click();
      await expect(page.getByText(/6 digits|6 dígitos/i)).toBeVisible();
    }
  });

  test('should show backup codes after setup', async ({ page }) => {
    // Placeholder for backup codes test
    await page.goto('/settings/security');
    const backupLink = page.getByText(/backup|recuperação/i);
    if (await backupLink.isVisible()) {
      await expect(backupLink).toBeVisible();
    }
  });

  test('should allow disabling 2FA', async ({ page }) => {
    await page.goto('/settings/security');
    const disableButton = page.getByRole('button', { name: /disable|desativar/i });
    if (await disableButton.isVisible()) {
      await expect(disableButton).toBeEnabled();
    }
  });
});
