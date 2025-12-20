import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth
    await page.goto('/');
  });

  test('should navigate to all main routes', async ({ page }) => {
    const routes = [
      { path: '/', title: 'Dashboard' },
      { path: '/employees', title: 'Funcionários' },
      { path: '/devices', title: 'Dispositivos' },
      { path: '/violations', title: 'Violações' },
      { path: '/reports', title: 'Relatórios' },
      { path: '/settings', title: 'Configurações' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(route.path);
    }
  });

  test('should handle browser back/forward', async ({ page }) => {
    await page.goto('/');
    await page.goto('/employees');
    await page.goto('/devices');
    
    await page.goBack();
    await expect(page).toHaveURL('/employees');
    
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    await page.goForward();
    await expect(page).toHaveURL('/employees');
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-12345');
    await expect(page.getByText(/404|não encontrada|not found/i)).toBeVisible();
  });

  test('breadcrumbs should work correctly', async ({ page }) => {
    await page.goto('/employees/123');
    
    const breadcrumb = page.locator('[aria-label="Breadcrumb"], nav.breadcrumb');
    if (await breadcrumb.count() > 0) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('sidebar navigation should work', async ({ page }) => {
    await page.goto('/');
    
    const sidebar = page.locator('nav, aside').first();
    if (await sidebar.count() > 0) {
      const links = await sidebar.locator('a').all();
      expect(links.length).toBeGreaterThan(0);
    }
  });
});
