import { test, expect } from '@playwright/test';
test.describe('Performance', () => {
  test('should load dashboard in under 3 seconds', async ({ page }) => { const start = Date.now(); await page.goto('/dashboard'); await page.waitForLoadState('networkidle'); const loadTime = Date.now() - start; expect(loadTime).toBeLessThan(3000); });
  test('should load employees list fast', async ({ page }) => { const start = Date.now(); await page.goto('/employees'); await page.waitForSelector('table'); const loadTime = Date.now() - start; expect(loadTime).toBeLessThan(2000); });
});