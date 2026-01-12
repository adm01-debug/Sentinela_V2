import { test, expect } from "@playwright/test";

test.describe("API Keys Management", () => {
  test("can generate API key", async ({ page }) => {
    await page.goto("/settings/api-keys");
    await page.click("button:has-text('Generate Key')");
    await page.fill("input[name='name']", "Production API");
    await page.click("button:has-text('Create')");
    await expect(page.locator("[data-testid='api-key']")).toBeVisible();
  });

  test("can revoke API key", async ({ page }) => {
    await page.goto("/settings/api-keys");
    await page.click("button:has-text('Revoke')");
    await page.click("button:has-text('Confirm')");
    await expect(page.locator("text=Key revoked")).toBeVisible();
  });

  test("shows API key only once", async ({ page }) => {
    await page.goto("/settings/api-keys");
    await page.click("button:has-text('Generate Key')");
    await expect(page.locator("text=This key will only be shown once")).toBeVisible();
  });
});
