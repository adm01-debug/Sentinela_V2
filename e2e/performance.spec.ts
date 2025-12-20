import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('dashboard should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve({
            lcp: entries.find(e => e.entryType === 'largest-contentful-paint')?.startTime,
          });
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({ lcp: null }), 5000);
      });
    });
    
    // LCP should be under 2.5s
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    await page.goto('/');
    
    const getMemory = async () => {
      return page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
    };
    
    const initialMemory = await getMemory();
    
    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/employees');
      await page.goto('/devices');
      await page.goto('/violations');
      await page.goto('/');
    }
    
    const finalMemory = await getMemory();
    
    // Memory should not grow more than 50%
    if (initialMemory > 0) {
      expect(finalMemory).toBeLessThan(initialMemory * 1.5);
    }
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img[loading="lazy"]').count();
    // Should have at least some lazy loaded images if there are images
    const totalImages = await page.locator('img').count();
    
    if (totalImages > 5) {
      expect(images).toBeGreaterThan(0);
    }
  });
});
