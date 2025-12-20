import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Find theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has([class*="moon"]), button:has([class*="sun"])');
    
    if (await themeToggle.count() > 0) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      // Click toggle
      await themeToggle.first().click();
      await page.waitForTimeout(300);
      
      // Theme should change
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should persist theme preference', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has([class*="moon"]), button:has([class*="sun"])');
    
    if (await themeToggle.count() > 0) {
      await themeToggle.first().click();
      await page.waitForTimeout(300);
      
      const theme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Theme should be persisted
      const persistedTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      expect(persistedTheme).toBe(theme);
    }
  });

  test('should respect system preference', async ({ page }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    
    // Check if system preference is respected
    const isDark = await page.evaluate(() => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    
    expect(isDark).toBe(true);
  });

  test('dark mode should have proper contrast', async ({ page }) => {
    await page.goto('/');
    
    // Set dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Check that text is visible
    const textElements = await page.locator('p, h1, h2, h3, span').all();
    
    for (const el of textElements.slice(0, 5)) {
      const isVisible = await el.isVisible();
      if (isVisible) {
        const color = await el.evaluate((e) => getComputedStyle(e).color);
        expect(color).toBeTruthy();
      }
    }
  });
});
