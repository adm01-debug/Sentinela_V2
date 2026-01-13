import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should have no axe violations on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    const outline = await focusedElement.evaluate(el => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/dashboard');
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.map(el => parseInt(el.tagName[1])));
    for (let i = 1; i < headings.length; i++) {
      expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});
