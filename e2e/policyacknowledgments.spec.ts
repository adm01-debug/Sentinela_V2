import { test, expect } from '@playwright/test';

test.describe('policyacknowledgments', () => {
  test('loads', async ({ page }) => {
    await expect(page).toBeTruthy();
  });
});