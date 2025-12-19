import { test, expect } from '@playwright/test';

// Setup: Login before each test
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      }));
    });
  });

  test('should display dashboard with stats cards', async ({ page }) => {
    await page.goto('/');

    // Check main elements are visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Check stats cards
    await expect(page.getByText(/funcionários/i)).toBeVisible();
    await expect(page.getByText(/dispositivos/i)).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    await page.goto('/');

    // Check sidebar
    await expect(page.getByRole('navigation')).toBeVisible();

    // Check main menu items
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /funcionários/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /violações/i })).toBeVisible();
  });

  test('should toggle sidebar collapse', async ({ page }) => {
    await page.goto('/');

    // Find collapse button
    const collapseButton = page.getByRole('button', { name: /recolher|expandir/i });
    
    if (await collapseButton.isVisible()) {
      await collapseButton.click();
      
      // Menu text should be hidden (sr-only)
      await expect(page.getByText('Sentinela')).not.toBeVisible();
    }
  });

  test('should navigate to employees page', async ({ page }) => {
    await page.goto('/');

    // Click employees link
    await page.getByRole('link', { name: /funcionários/i }).click();

    // Check navigation
    await expect(page).toHaveURL(/\/employees/);
  });

  test('should display notifications badge', async ({ page }) => {
    await page.goto('/');

    // Check notifications button exists
    const notifButton = page.getByRole('button', { name: /notificações/i });
    await expect(notifButton).toBeVisible();
  });

  test('should open user menu', async ({ page }) => {
    await page.goto('/');

    // Click user menu
    const userMenuButton = page.getByRole('button', { name: /menu do usuário/i });
    await userMenuButton.click();

    // Check dropdown items
    await expect(page.getByRole('menuitem', { name: /configurações/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /sair/i })).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle
    const themeButton = page.getByRole('button', { name: /modo claro|modo escuro/i });
    
    if (await themeButton.isVisible()) {
      // Get initial theme
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');

      // Toggle theme
      await themeButton.click();

      // Check theme changed
      const newClass = await html.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });
});

test.describe('Dashboard - Responsive', () => {
  test('should show mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu button should be visible
    const mobileMenuButton = page.getByRole('button', { name: /abrir menu/i });
    await expect(mobileMenuButton).toBeVisible();
  });

  test('should hide sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Sidebar should be hidden
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeVisible();
  });
});
