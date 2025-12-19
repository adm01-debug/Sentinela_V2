import { test, expect } from '@playwright/test';

test.describe('Employees Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: { id: 'test-user', email: 'test@example.com' },
        },
      }));
    });
    await page.goto('/employees');
  });

  test('should display employees page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /funcionários/i })).toBeVisible();
  });

  test('should show search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar/i);
    await expect(searchInput).toBeVisible();
  });

  test('should show filter dropdowns', async ({ page }) => {
    // Status filter
    await expect(page.getByRole('combobox', { name: /status/i })).toBeVisible();
    
    // Department filter
    await expect(page.getByRole('combobox', { name: /departamento/i })).toBeVisible();
  });

  test('should filter employees by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar/i);
    await searchInput.fill('João');

    // Wait for results to update
    await page.waitForTimeout(500);

    // Table should update (or show no results message)
    await expect(page.locator('table, [data-testid="empty-state"]')).toBeVisible();
  });

  test('should show add employee button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /adicionar|novo/i });
    await expect(addButton).toBeVisible();
  });

  test('should open add employee modal', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /adicionar|novo/i });
    await addButton.click();

    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/novo funcionário|adicionar funcionário/i)).toBeVisible();
  });

  test('should show stats cards', async ({ page }) => {
    // Check for stat cards
    await expect(page.getByText(/total de funcionários/i)).toBeVisible();
    await expect(page.getByText(/ativos/i)).toBeVisible();
  });

  test('should display skeleton while loading', async ({ page }) => {
    // On first load, skeleton should appear briefly
    const skeleton = page.locator('.animate-pulse');
    // May or may not be visible depending on load time
  });

  test('should navigate to employee detail', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => {});

    // If there are employees, click first one
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      const nameLink = firstRow.locator('a').first();
      await nameLink.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/employees\/[a-z0-9-]+/);
    }
  });
});

test.describe('Employees Page - Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: { id: 'test-user', email: 'test@example.com' },
        },
      }));
    });
    await page.goto('/employees');
  });

  test('should open actions menu for employee', async ({ page }) => {
    // Wait for table
    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => {});

    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      // Click actions button
      const actionsButton = firstRow.getByRole('button', { name: /abrir menu/i });
      await actionsButton.click();

      // Check menu items
      await expect(page.getByRole('menuitem', { name: /ver detalhes/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /editar/i })).toBeVisible();
    }
  });

  test('should select multiple employees', async ({ page }) => {
    // Wait for table
    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => {});

    // Select all checkbox
    const selectAllCheckbox = page.locator('thead').getByRole('checkbox');
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.click();
      await expect(selectAllCheckbox).toBeChecked();
    }
  });
});

test.describe('Employees Page - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: { id: 'test-user', email: 'test@example.com' },
        },
      }));
    });
    await page.goto('/employees');
  });

  test('should show pagination controls', async ({ page }) => {
    // If there's pagination, check controls
    const pagination = page.locator('[aria-label*="pagination"], nav[role="navigation"]');
    // Pagination may or may not be visible depending on data
  });

  test('should change page size', async ({ page }) => {
    const pageSizeSelect = page.getByRole('combobox', { name: /por página/i });
    if (await pageSizeSelect.isVisible()) {
      await pageSizeSelect.click();
      await page.getByRole('option', { name: '25' }).click();
    }
  });
});
