import { test, expect } from '@playwright/test';

test.describe('aianalysis', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/aianalysis');
    await expect(page).toHaveURL(/aianalysis/);
  });
});