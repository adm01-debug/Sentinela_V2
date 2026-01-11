import { test, expect } from '@playwright/test';
test.describe('Activities Timeline', () => {
  test('should display timeline', async ({ page }) => { await page.goto('/activities'); await expect(page.getByTestId('activity-timeline')).toBeVisible(); });
  test('should filter by date', async ({ page }) => { await page.goto('/activities'); await page.getByTestId('date-picker').click(); await page.getByText('Last 7 days').click(); await expect(page.getByTestId('activity-item')).toHaveCount(7); });
});