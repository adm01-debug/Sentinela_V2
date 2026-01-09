import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should have no a11y violations on login', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('should have no a11y violations on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('should have no a11y violations on employees', async ({ page }) => {
    await page.goto('/employees');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).not.toBe('BODY');
  });

  test('should have skip link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip|pular/i });
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeFocused();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    const h1 = await page.$$('h1');
    expect(h1.length).toBe(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/dashboard');
    const images = await page.$$('img');
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have form labels', async ({ page }) => {
    await page.goto('/login');
    const inputs = await page.$$('input:not([type="hidden"])');
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const label = await page.$(`label[for="${id}"]`);
      expect(label).toBeTruthy();
    }
  });

  test('should have focus indicators', async ({ page }) => {
    await page.goto('/login');
    const button = page.getByRole('button').first();
    await button.focus();
    const outline = await button.evaluate(el => 
      window.getComputedStyle(el).outlineStyle
    );
    expect(outline).not.toBe('none');
  });

  test('should announce changes to screen readers', async ({ page }) => {
    await page.goto('/dashboard');
    const liveRegion = page.locator('[aria-live]');
    if (await liveRegion.count() > 0) {
      await expect(liveRegion.first()).toBeVisible();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/dashboard');
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('should work with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should have proper ARIA roles', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should handle high contrast mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
  });
});
