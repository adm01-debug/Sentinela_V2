import { test, expect } from '@playwright/test';

test.describe('Webhooks', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display page title', async ({ page }) => {
    await page.goto('/webhooks');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should load content', async ({ page }) => {
    await page.goto('/webhooks');
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    // Verificar que não há erro
    await expect(page.getByText('Erro')).not.toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/webhooks');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
