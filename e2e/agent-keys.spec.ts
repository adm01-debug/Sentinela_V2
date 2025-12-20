import { test, expect } from '@playwright/test';

test.describe('Agent Keys Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agent-keys');
  });

  test('should display agent keys page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /chaves.*agente/i })).toBeVisible();
  });

  test('should have create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /criar|nova|adicionar/i })).toBeVisible();
  });

  test('should display keys table or empty state', async ({ page }) => {
    const table = page.getByRole('table');
    const emptyState = page.getByText(/nenhuma.*chave/i);
    
    await expect(table.or(emptyState)).toBeVisible();
  });

  test('should open create dialog when clicking create button', async ({ page }) => {
    await page.getByRole('button', { name: /criar|nova|adicionar/i }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
