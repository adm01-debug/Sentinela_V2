import { test, expect } from "@playwright/test";

test.describe("Data Export", () => {
  test("can export to CSV", async ({ page }) => {
    await page.goto("/reports");
    await page.click("button:has-text('Export')");
    await page.click("text=CSV");
    const download = await page.waitForEvent("download");
    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("can export to PDF", async ({ page }) => {
    await page.goto("/reports");
    await page.click("button:has-text('Export')");
    await page.click("text=PDF");
    const download = await page.waitForEvent("download");
    expect(download.suggestedFilename()).toContain(".pdf");
  });

  test("can schedule export", async ({ page }) => {
    await page.goto("/reports");
    await page.click("button:has-text('Schedule Export')");
    await page.selectOption("select[name='frequency']", "weekly");
    await page.click("button:has-text('Save')");
    await expect(page.locator("text=Export scheduled")).toBeVisible();
  });
});
