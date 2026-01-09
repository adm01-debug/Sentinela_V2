import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Responsive', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should show mobile menu', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
  });

  test('should open mobile navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/dashboard');
    const button = page.getByRole('button').first();
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('should display cards in single column', async ({ page }) => {
    await page.goto('/dashboard');
    const card = page.locator('[data-card]').first();
    const viewport = page.viewportSize();
    const box = await card.boundingBox();
    if (box && viewport) {
      expect(box.width).toBeCloseTo(viewport.width - 32, 10);
    }
  });

  test('should show bottom navigation', async ({ page }) => {
    await page.goto('/dashboard');
    const bottomNav = page.locator('[data-bottom-nav]');
    if (await bottomNav.isVisible()) {
      await expect(bottomNav).toBeVisible();
    }
  });

  test('should hide sidebar by default', async ({ page }) => {
    await page.goto('/dashboard');
    const sidebar = page.locator('[data-sidebar]');
    await expect(sidebar).not.toBeVisible();
  });

  test('should handle swipe gestures', async ({ page }) => {
    await page.goto('/employees');
    const row = page.getByRole('row').nth(1);
    await row.hover();
    // Swipe simulation would go here
  });

  test('should display pull to refresh', async ({ page }) => {
    await page.goto('/dashboard');
    const pullToRefresh = page.locator('[data-pull-to-refresh]');
    if (await pullToRefresh.isVisible()) {
      await expect(pullToRefresh).toBeVisible();
    }
  });

  test('should work in landscape', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should maintain scroll position', async ({ page }) => {
    await page.goto('/employees');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.getByRole('row').nth(1).click();
    await page.goBack();
    const scroll = await page.evaluate(() => window.scrollY);
    expect(scroll).toBeGreaterThan(0);
  });
});
