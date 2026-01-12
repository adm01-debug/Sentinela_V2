import { test, expect } from "@playwright/test";

test.describe("Team Management", () => {
  test("can create team", async ({ page }) => {
    await page.goto("/admin/teams");
    await page.click("button:has-text('New Team')");
    await page.fill("input[name='name']", "Engineering");
    await page.click("button:has-text('Create')");
    await expect(page.locator("text=Team created")).toBeVisible();
  });

  test("can add members to team", async ({ page }) => {
    await page.goto("/admin/teams/1");
    await page.click("button:has-text('Add Member')");
    await page.click("text=John Doe");
    await expect(page.locator("text=Member added")).toBeVisible();
  });

  test("can remove members from team", async ({ page }) => {
    await page.goto("/admin/teams/1");
    await page.click("button:has-text('Remove')");
    await expect(page.locator("text=Member removed")).toBeVisible();
  });
});
