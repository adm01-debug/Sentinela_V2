import { test, expect } from '@playwright/test';

test.describe('Work Schedules Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work-schedules');
  });

  test('should display schedules page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /hor.rios/i })).toBeVisible();
  });

  test('should have create schedule button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /novo/i })).toBeVisible();
  });

  test('should show schedule list or empty state', async ({ page }) => {
    const hasSchedules = await page.locator('[data-testid="schedule-card"]').count() > 0;
    if (!hasSchedules) {
      await expect(page.getByText(/nenhum/i)).toBeVisible();
    }
  });

  test('should open create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /novo/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
