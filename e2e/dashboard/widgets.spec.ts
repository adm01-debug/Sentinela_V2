import { test, expect } from '@playwright/test';

test.describe('Dashboard Widgets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display all widgets', async ({ page }) => {
    await expect(page.getByTestId('widget-employees')).toBeVisible();
    await expect(page.getByTestId('widget-violations')).toBeVisible();
    await expect(page.getByTestId('widget-productivity')).toBeVisible();
    await expect(page.getByTestId('widget-activity')).toBeVisible();
  });

  test('should customize widget layout', async ({ page }) => {
    await page.getByRole('button', { name: /personalizar/i }).click();
    await page.getByRole('checkbox', { name: /widget-employees/i }).uncheck();
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByTestId('widget-employees')).not.toBeVisible();
  });

  test('should drag and drop widgets', async ({ page }) => {
    const widget = page.getByTestId('widget-employees');
    const target = page.getByTestId('widget-violations');
    await widget.dragTo(target);
  });

  test('should expand widget', async ({ page }) => {
    await page.getByTestId('widget-employees').getByRole('button', { name: /expandir/i }).click();
    await expect(page.getByTestId('widget-employees')).toHaveClass(/expanded/);
  });

  test('should refresh individual widget', async ({ page }) => {
    await page.getByTestId('widget-employees').getByRole('button', { name: /atualizar/i }).click();
    await expect(page.getByTestId('widget-employees').getByText(/atualizado/i)).toBeVisible();
  });

  test('should show widget settings', async ({ page }) => {
    await page.getByTestId('widget-employees').getByRole('button', { name: /configurações/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should filter widget data', async ({ page }) => {
    await page.getByTestId('widget-violations').getByRole('combobox').selectOption('high');
    await expect(page.getByTestId('widget-violations')).toContainText(/alta/i);
  });
});
