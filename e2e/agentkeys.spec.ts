import { test, expect } from '@playwright/test';

test.describe('agentkeys', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/agentkeys');
    await expect(page).toHaveURL(/agentkeys/);
  });
});