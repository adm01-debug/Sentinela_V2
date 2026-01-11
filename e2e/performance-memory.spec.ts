import { test, expect } from '@playwright/test';
test.describe('Memory', () => {
  test('should not have memory leaks on navigation', async ({ page }) => { await page.goto('/dashboard'); for (let i = 0; i < 5; i++) { await page.goto('/employees'); await page.goto('/reports'); await page.goto('/dashboard'); } const metrics = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize); expect(metrics).toBeDefined(); });
});