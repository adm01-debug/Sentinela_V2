import { test, expect } from '@playwright/test';
test.describe('Profile Settings', () => {
  test('should update profile', async ({ page }) => { await page.goto('/settings/profile'); await page.getByLabel('Name').fill('Updated Name'); await page.getByRole('button', { name: 'Save' }).click(); await expect(page.getByText('Profile updated')).toBeVisible(); });
  test('should change password', async ({ page }) => { await page.goto('/settings/profile'); await page.getByText('Change Password').click(); await page.getByLabel('Current Password').fill('oldpass'); await page.getByLabel('New Password').fill('newpass123'); await page.getByRole('button', { name: 'Update Password' }).click(); });
});