import { test, expect } from '@playwright/test';
test.describe('Screen Reader', () => {
  test('should have proper aria labels', async ({ page }) => { await page.goto('/dashboard'); await expect(page.getByRole('navigation')).toHaveAttribute('aria-label'); await expect(page.getByRole('main')).toBeVisible(); });
  test('should have proper headings', async ({ page }) => { await page.goto('/dashboard'); const headings = await page.getByRole('heading').all(); expect(headings.length).toBeGreaterThan(0); });
});