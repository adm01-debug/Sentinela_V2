import { test, expect } from "@playwright/test";

test.describe("Integrations", () => {
  test("shows available integrations", async ({ page }) => {
    await page.goto("/settings/integrations");
    await expect(page.locator("[data-testid='integrations-list']")).toBeVisible();
  });

  test("can connect Slack", async ({ page }) => {
    await page.goto("/settings/integrations");
    await page.click("button:has-text('Connect Slack')");
    await expect(page.locator("text=Authorize")).toBeVisible();
  });

  test("can disconnect integration", async ({ page }) => {
    await page.goto("/settings/integrations");
    await page.click("button:has-text('Disconnect')");
    await expect(page.locator("text=Disconnected")).toBeVisible();
  });
});
