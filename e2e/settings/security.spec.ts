import { test, expect } from '@playwright/test';

test.describe('Security Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/security');
  });

  test('should display security options', async ({ page }) => {
    await expect(page.getByText(/autenticação/i)).toBeVisible();
    await expect(page.getByText(/sessões/i)).toBeVisible();
  });

  test('should enable 2FA', async ({ page }) => {
    await page.getByRole('button', { name: /ativar 2FA/i }).click();
    await expect(page.getByTestId('qr-code')).toBeVisible();
  });

  test('should change password', async ({ page }) => {
    await page.getByLabel(/senha atual/i).fill('currentpass');
    await page.getByLabel(/nova senha/i).fill('NewPass123!');
    await page.getByLabel(/confirmar/i).fill('NewPass123!');
    await page.getByRole('button', { name: /alterar senha/i }).click();
    await expect(page.getByText(/senha alterada/i)).toBeVisible();
  });

  test('should view active sessions', async ({ page }) => {
    await page.getByRole('tab', { name: /sessões/i }).click();
    await expect(page.getByTestId('sessions-list')).toBeVisible();
  });

  test('should revoke session', async ({ page }) => {
    await page.getByRole('tab', { name: /sessões/i }).click();
    await page.getByRole('button', { name: /revogar/i }).first().click();
    await expect(page.getByText(/sessão encerrada/i)).toBeVisible();
  });

  test('should configure IP whitelist', async ({ page }) => {
    await page.getByRole('tab', { name: /ip/i }).click();
    await page.getByLabel(/ip/i).fill('192.168.1.1');
    await page.getByRole('button', { name: /adicionar/i }).click();
    await expect(page.getByText('192.168.1.1')).toBeVisible();
  });

  test('should view audit log', async ({ page }) => {
    await page.getByRole('tab', { name: /auditoria/i }).click();
    await expect(page.getByTestId('audit-log')).toBeVisible();
  });

  test('should export audit log', async ({ page }) => {
    await page.getByRole('tab', { name: /auditoria/i }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /exportar/i }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('audit');
  });
});
