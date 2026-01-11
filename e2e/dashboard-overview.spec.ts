import { test, expect } from '@playwright/test';
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/login'); await page.getByLabel('Email').fill('admin@sentinela.com'); await page.getByLabel('Password').fill('admin123'); await page.getByRole('button', { name: 'Login' }).click(); await page.waitForURL('/dashboard'); });
  test('should display stats cards', async ({ page }) => { await expect(page.getByTestId('stats-cards')).toBeVisible(); });
  test('should display activity chart', async ({ page }) => { await expect(page.getByTestId('activity-chart')).toBeVisible(); });
  test('should display recent activity', async ({ page }) => { await expect(page.getByTestId('recent-activity')).toBeVisible(); });
});