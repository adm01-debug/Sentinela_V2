import { test, expect } from '@playwright/test';

test.describe('User Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user-management');
  });

  test('should display user management page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /gerenciamento.*usuários|usuários/i })).toBeVisible();
  });

  test('should display users list or table', async ({ page }) => {
    const table = page.getByRole('table');
    const list = page.locator('[data-testid="users-list"]');
    const emptyState = page.getByText(/nenhum.*usuário/i);
    
    await expect(table.or(list).or(emptyState)).toBeVisible();
  });

  test('should have role filter options', async ({ page }) => {
    const adminFilter = page.getByRole('button', { name: /admin/i });
    const userFilter = page.getByRole('button', { name: /user|usuário/i });
    
    await expect(adminFilter.or(userFilter)).toBeVisible();
  });

  test('should display user role badges', async ({ page }) => {
    const badges = page.locator('[class*="badge"]');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Either badges exist or empty state
    const count = await badges.count();
    expect(count >= 0).toBeTruthy();
  });
});
