import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load dashboard under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have acceptable LCP', async ({ page }) => {
    await page.goto('/dashboard');
    const lcp = await page.evaluate(() => new Promise(resolve => {
      new PerformanceObserver(list => resolve(list.getEntries()[0]?.startTime)).observe({ entryTypes: ['largest-contentful-paint'] });
    }));
    expect(lcp).toBeLessThan(2500);
  });

  test('should render large lists efficiently', async ({ page }) => {
    await page.goto('/employees');
    const start = Date.now();
    await page.waitForSelector('[data-testid="employee-row"]');
    const renderTime = Date.now() - start;
    expect(renderTime).toBeLessThan(1000);
  });

  test('should handle pagination smoothly', async ({ page }) => {
    await page.goto('/employees');
    const start = Date.now();
    await page.click('[data-testid="next-page"]');
    await page.waitForSelector('[data-testid="employee-row"]');
    const pageTime = Date.now() - start;
    expect(pageTime).toBeLessThan(500);
  });

  test('should have acceptable bundle size', async ({ page }) => {
    const [response] = await Promise.all([page.waitForResponse(r => r.url().includes('.js')), page.goto('/dashboard')]);
    const buffer = await response.body();
    expect(buffer.length).toBeLessThan(500 * 1024); // 500KB
  });
});
