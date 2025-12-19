import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('desktop layout should show sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('mobile layout should hide sidebar by default', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Sidebar should be hidden on mobile
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).not.toBeVisible();
  });

  test('mobile should have hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
  });

  test('tablet layout should work', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Should have some form of navigation
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

test.describe('Mobile Device Tests', () => {
  test.use({ ...devices['iPhone 13'] });

  test('should render correctly on iPhone', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/sentinela/i);
  });
});

test.describe('Tablet Device Tests', () => {
  test.use({ ...devices['iPad Pro 11'] });

  test('should render correctly on iPad', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/sentinela/i);
  });
});
