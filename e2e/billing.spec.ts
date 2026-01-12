import { test, expect } from "@playwright/test";

test.describe("Billing", () => {
  test("shows current plan", async ({ page }) => {
    await page.goto("/settings/billing");
    await expect(page.locator("[data-testid='current-plan']")).toBeVisible();
  });

  test("can upgrade plan", async ({ page }) => {
    await page.goto("/settings/billing");
    await page.click("button:has-text('Upgrade')");
    await expect(page.locator("text=Select a plan")).toBeVisible();
  });

  test("shows invoice history", async ({ page }) => {
    await page.goto("/settings/billing");
    await page.click("text=Invoice History");
    await expect(page.locator("[data-testid='invoice-list']")).toBeVisible();
  });
});
