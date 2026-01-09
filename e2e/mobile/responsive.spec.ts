import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Responsive', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('mobile-nav')).toBeVisible();
    await expect(page.getByTestId('hamburger-menu')).toBeVisible();
  });

  test('should open mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('hamburger-menu').click();
    await expect(page.getByTestId('mobile-sidebar')).toBeVisible();
  });

  test('should navigate via mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('hamburger-menu').click();
    await page.getByRole('link', { name: /funcionários/i }).click();
    await expect(page).toHaveURL(/employees/);
  });

  test('should display bottom navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/dashboard');
    const button = page.getByRole('button').first();
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('should show mobile-optimized tables', async ({ page }) => {
    await page.goto('/employees');
    await expect(page.getByTestId('mobile-list')).toBeVisible();
  });

  test('should support pull to refresh', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByTestId('pull-to-refresh').evaluate(el => {
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientY: 0 }] }));
      el.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientY: 100 }] }));
      el.dispatchEvent(new TouchEvent('touchend'));
    });
  });

  test('should have swipe actions', async ({ page }) => {
    await page.goto('/employees');
    const row = page.getByTestId('employee-row').first();
    await row.evaluate(el => {
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 300 }] }));
      el.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 100 }] }));
      el.dispatchEvent(new TouchEvent('touchend'));
    });
    await expect(page.getByTestId('swipe-actions')).toBeVisible();
  });

  test('should adapt forms for mobile', async ({ page }) => {
    await page.goto('/employees/new');
    const input = page.getByLabel(/nome/i);
    await expect(input).toHaveAttribute('autocomplete');
  });

  test('should show mobile-friendly charts', async ({ page }) => {
    await page.goto('/dashboard');
    const chart = page.getByTestId('activity-chart');
    const box = await chart.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });
});
