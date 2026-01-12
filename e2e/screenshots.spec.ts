import { test, expect } from '@playwright/test';

test.describe('Screenshots', () => {
  test('should display screenshot gallery', async ({ page }) => {
    await page.goto('/screenshots');
    await expect(page.getByTestId('screenshot-gallery')).toBeVisible();
  });

  test('should toggle view mode', async ({ page }) => {
    await page.goto('/screenshots');
    await page.click('[data-testid="view-list"]');
    await expect(page.getByTestId('list-view')).toBeVisible();
  });

  test('should filter by date', async ({ page }) => {
    await page.goto('/screenshots');
    await page.click('[data-testid="date-picker"]');
    await page.click('text=Hoje');
    await expect(page.getByTestId('screenshot-gallery')).toBeVisible();
  });
});
