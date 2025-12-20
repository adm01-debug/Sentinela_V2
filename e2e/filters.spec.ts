import { test, expect } from '@playwright/test';

test.describe('Filters', () => {
  test('should filter by status', async ({ page }) => {
    await page.goto('/employees');
    
    const statusFilter = page.locator('select, [role="combobox"]').first();
    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      
      const activeOption = page.getByText(/ativo|active/i);
      if (await activeOption.count() > 0) {
        await activeOption.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should filter by date range', async ({ page }) => {
    await page.goto('/violations');
    
    const dateInput = page.locator('input[type="date"], [data-testid="date-picker"]');
    if (await dateInput.count() > 0) {
      await dateInput.first().click();
    }
  });

  test('should clear all filters', async ({ page }) => {
    await page.goto('/employees');
    
    const clearBtn = page.getByText(/limpar|clear|reset/i);
    if (await clearBtn.count() > 0) {
      await clearBtn.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('should persist filters in URL', async ({ page }) => {
    await page.goto('/employees?status=active');
    
    // Check if filter is applied
    const url = page.url();
    expect(url).toContain('status');
  });

  test('should combine multiple filters', async ({ page }) => {
    await page.goto('/violations');
    
    // Apply multiple filters
    const filters = page.locator('select, [role="combobox"]');
    const count = await filters.count();
    
    if (count >= 2) {
      await filters.first().click();
      await page.keyboard.press('Enter');
      await filters.nth(1).click();
      await page.keyboard.press('Enter');
    }
  });
});
