import { test, expect } from '@playwright/test';

test.describe('Employees Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/employees**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: '1', name: 'John Doe', email: 'john@test.com', status: 'active' },
          { id: '2', name: 'Jane Smith', email: 'jane@test.com', status: 'active' },
        ]),
      });
    });
    
    await page.goto('/employees');
  });

  test('should display employees list', async ({ page }) => {
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  test('should filter employees by search', async ({ page }) => {
    await page.fill('input[placeholder*="buscar" i]', 'John');
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).not.toBeVisible();
  });

  test('should open create employee dialog', async ({ page }) => {
    await page.getByRole('button', { name: /novo|new|adicionar/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /novo|new|adicionar/i }).click();
    await page.getByRole('button', { name: /criar|create|salvar/i }).click();
    await expect(page.getByText(/nome.*obrigatório|name.*required/i)).toBeVisible();
  });
});
