import { test, expect } from '@playwright/test';

test.describe('dataexport', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/dataexport');
    await expect(page).toHaveURL(/dataexport/);
  });
});