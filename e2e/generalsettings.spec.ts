import { test, expect } from '@playwright/test';

test.describe('generalsettings', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/generalsettings');
    await expect(page).toHaveURL(/generalsettings/);
  });
});