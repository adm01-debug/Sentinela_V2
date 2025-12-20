import { test, expect } from '@playwright/test';

test.describe('Rate Limit Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rate-limit-dashboard');
  });

  test('should display rate limit dashboard title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /rate.*limit|limite.*requisições/i })).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    const statsCards = page.locator('[class*="card"]');
    
    await page.waitForLoadState('networkidle');
    
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display blocked IPs section', async ({ page }) => {
    const blockedSection = page.getByText(/bloqueado|blocked/i);
    
    await expect(blockedSection).toBeVisible();
  });

  test('should have refresh button or auto-refresh indicator', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /refresh|atualizar/i });
    const autoRefresh = page.getByText(/auto.*refresh|atualização.*automática/i);
    
    await expect(refreshButton.or(autoRefresh)).toBeVisible();
  });

  test('should display charts or tables for rate limit data', async ({ page }) => {
    const chart = page.locator('[class*="recharts"]');
    const table = page.getByRole('table');
    
    await page.waitForLoadState('networkidle');
    
    await expect(chart.or(table)).toBeVisible();
  });
});
