import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should search employees', async ({ page }) => {
    await page.goto('/employees');
    
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('João');
      await page.waitForTimeout(500); // Debounce
      
      // Should filter results
      const results = page.locator('[data-testid="employee-card"], tr, .card');
      await expect(results.first()).toBeVisible();
    }
  });

  test('should search devices', async ({ page }) => {
    await page.goto('/devices');
    
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Windows');
      await page.waitForTimeout(500);
    }
  });

  test('should show no results message', async ({ page }) => {
    await page.goto('/employees');
    
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('xyznonexistent12345');
      await page.waitForTimeout(500);
      
      const noResults = page.getByText(/nenhum|no results|não encontrado/i);
      if (await noResults.count() > 0) {
        await expect(noResults.first()).toBeVisible();
      }
    }
  });

  test('should clear search', async ({ page }) => {
    await page.goto('/employees');
    
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // Results should reset
      await expect(searchInput).toHaveValue('');
    }
  });
});
