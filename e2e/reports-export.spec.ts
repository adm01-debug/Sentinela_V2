import { test, expect } from '@playwright/test';
test.describe('Report Export', () => {
  test('should export as PDF', async ({ page }) => { await page.goto('/reports'); await page.getByRole('row').first().getByRole('button', { name: 'Export' }).click(); await page.getByText('PDF').click(); const download = await page.waitForEvent('download'); expect(download.suggestedFilename()).toContain('.pdf'); });
  test('should export as CSV', async ({ page }) => { await page.goto('/reports'); await page.getByRole('row').first().getByRole('button', { name: 'Export' }).click(); await page.getByText('CSV').click(); const download = await page.waitForEvent('download'); expect(download.suggestedFilename()).toContain('.csv'); });
});