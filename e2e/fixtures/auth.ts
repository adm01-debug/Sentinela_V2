import { test as base, expect } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: any;
  adminPage: any;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.fill("input[name='email']", "test@example.com");
    await page.fill("input[name='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForURL("/dashboard");
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.fill("input[name='email']", "admin@example.com");
    await page.fill("input[name='password']", "admin123");
    await page.click("button[type='submit']");
    await page.waitForURL("/dashboard");
    await use(page);
  },
});

export { expect };
