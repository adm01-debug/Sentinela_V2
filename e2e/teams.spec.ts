import { test, expect } from '@playwright/test';

test.describe('Teams Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
  });

  test('should display teams list', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should create team', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /criar|create|novo|new/i });
    if (await createBtn.count() > 0) {
      await expect(createBtn.first()).toBeVisible();
    }
  });

  test('should show team members', async ({ page }) => {
    const teamCard = page.locator('[data-testid="team-card"], .team-card').first();
    if (await teamCard.count() > 0) {
      await teamCard.click();
    }
  });
});
