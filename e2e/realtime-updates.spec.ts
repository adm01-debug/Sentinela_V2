import { test, expect } from '@playwright/test';
test.describe('Realtime', () => {
  test('should show realtime indicator', async ({ page }) => { await page.goto('/dashboard'); await expect(page.getByTestId('realtime-indicator')).toBeVisible(); });
});