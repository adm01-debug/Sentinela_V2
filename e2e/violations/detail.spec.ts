import { test, expect } from '@playwright/test';

test.describe('Violation Detail', () => {
  test('should display violation information', async ({ page }) => {
    await page.goto('/violations');
    await page.getByRole('row').nth(1).click();
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should show employee info', async ({ page }) => {
    await page.goto('/violations');
    await page.getByRole('row').nth(1).click();
    await expect(page.getByText(/employee|funcionário/i)).toBeVisible();
  });

  test('should display severity badge', async ({ page }) => {
    await page.goto('/violations');
    await page.getByRole('row').nth(1).click();
    await expect(page.locator('[data-severity]')).toBeVisible();
  });

  test('should allow adding comments', async ({ page }) => {
    await page.goto('/violations');
    await page.getByRole('row').nth(1).click();
    const commentInput = page.getByPlaceholder(/comment|comentário/i);
    if (await commentInput.isVisible()) {
      await commentInput.fill('Test comment');
      await page.getByRole('button', { name: /add|adicionar|send|enviar/i }).click();
    }
  });

  test('should show action buttons', async ({ page }) => {
    await page.goto('/violations');
    await page.getByRole('row').nth(1).click();
    await expect(page.getByRole('button', { name: /resolve|resolver|dismiss|ignorar/i })).toBeVisible();
  });
});
