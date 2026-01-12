import { test, expect } from "@playwright/test";

test.describe("User Management", () => {
  test("can create new user", async ({ page }) => {
    await page.goto("/admin/users");
    await page.click("button:has-text('Add User')");
    await page.fill("input[name='email']", "test@example.com");
    await page.fill("input[name='name']", "Test User");
    await page.click("button:has-text('Save')");
    await expect(page.locator("text=User created")).toBeVisible();
  });

  test("can edit user", async ({ page }) => {
    await page.goto("/admin/users");
    await page.click("button:has-text('Edit')");
    await page.fill("input[name='name']", "Updated Name");
    await page.click("button:has-text('Save')");
    await expect(page.locator("text=User updated")).toBeVisible();
  });

  test("can delete user", async ({ page }) => {
    await page.goto("/admin/users");
    await page.click("button:has-text('Delete')");
    await page.click("button:has-text('Confirm')");
    await expect(page.locator("text=User deleted")).toBeVisible();
  });

  test("validates required fields", async ({ page }) => {
    await page.goto("/admin/users");
    await page.click("button:has-text('Add User')");
    await page.click("button:has-text('Save')");
    await expect(page.locator("text=Email is required")).toBeVisible();
  });
});
