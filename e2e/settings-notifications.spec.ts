import { test, expect } from '@playwright/test';
test.describe('Notification Settings', () => {
  test('should toggle email notifications', async ({ page }) => { await page.goto('/settings/notifications'); await page.getByLabel('Email Notifications').click(); await page.getByRole('button', { name: 'Save' }).click(); await expect(page.getByText('Settings saved')).toBeVisible(); });
});