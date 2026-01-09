import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should pass accessibility checks', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('dashboard should pass accessibility checks', async ({ page }) => {
    await page.goto('/dashboard');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('should have skip link', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByText(/pular para conteúdo/i)).toBeFocused();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('link').first()).toBeFocused();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/dashboard');
    const images = page.locator('img');
    for (const img of await images.all()) {
      await expect(img).toHaveAttribute('alt');
    }
  });

  test('forms should have labels', async ({ page }) => {
    await page.goto('/employees/new');
    const inputs = page.locator('input:not([type="hidden"])');
    for (const input of await inputs.all()) {
      const id = await input.getAttribute('id');
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toBeVisible();
    }
  });

  test('should announce dynamic content', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /atualizar/i }).click();
    const liveRegion = page.locator('[aria-live]');
    await expect(liveRegion).toHaveText(/atualizado/i);
  });

  test('should support reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dashboard');
    const animations = await page.evaluate(() => {
      return getComputedStyle(document.body).getPropertyValue('--animation-duration');
    });
    expect(animations).toBe('0ms');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/dashboard');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations).toEqual([]);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    const outline = await focusedElement.evaluate(el => 
      getComputedStyle(el).outlineWidth
    );
    expect(parseInt(outline)).toBeGreaterThan(0);
  });

  test('modals should trap focus', async ({ page }) => {
    await page.goto('/employees/new');
    await page.getByRole('button', { name: /salvar/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Tab');
    const focusedInDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog?.contains(document.activeElement);
    });
    expect(focusedInDialog).toBe(true);
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/dashboard');
    const srOnly = page.locator('.sr-only');
    await expect(srOnly.first()).toBeAttached();
  });

  test('tables should have proper structure', async ({ page }) => {
    await page.goto('/employees');
    const table = page.getByRole('table');
    await expect(table.getByRole('columnheader')).toHaveCount.greaterThan(0);
    await expect(table.locator('th[scope="col"]')).toHaveCount.greaterThan(0);
  });
});
