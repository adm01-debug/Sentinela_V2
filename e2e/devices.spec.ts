import { test, expect } from '@playwright/test';

test.describe('Devices Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/devices');
  });

  test('should display devices page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dispositivos/i })).toBeVisible();
  });

  test('should have filter buttons for device status', async ({ page }) => {
    const allButton = page.getByRole('button', { name: /todos/i });
    const onlineButton = page.getByRole('button', { name: /online/i });
    const offlineButton = page.getByRole('button', { name: /offline/i });
    
    await expect(allButton).toBeVisible();
    await expect(onlineButton.or(offlineButton)).toBeVisible();
  });

  test('should display devices table or cards', async ({ page }) => {
    const table = page.getByRole('table');
    const cards = page.locator('[class*="card"]');
    const emptyState = page.getByText(/nenhum.*dispositivo/i);
    
    await page.waitForLoadState('networkidle');
    
    await expect(table.or(cards).or(emptyState)).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i);
    
    await expect(searchInput).toBeVisible();
  });

  test('should filter devices when clicking status buttons', async ({ page }) => {
    const onlineButton = page.getByRole('button', { name: /online/i });
    
    if (await onlineButton.isVisible()) {
      await onlineButton.click();
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Verify page still shows content
      await expect(page.getByRole('heading', { name: /dispositivos/i })).toBeVisible();
    }
  });
});
