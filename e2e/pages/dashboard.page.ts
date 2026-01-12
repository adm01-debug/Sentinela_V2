import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly statsCards: Locator;
  readonly activityFeed: Locator;
  readonly sidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator("[data-testid='welcome']");
    this.statsCards = page.locator("[data-testid='stats-card']");
    this.activityFeed = page.locator("[data-testid='activity-feed']");
    this.sidebar = page.locator("[data-testid='sidebar']");
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async expectWelcome(name: string) {
    await expect(this.welcomeMessage).toContainText(name);
  }

  async getStatsCount() {
    return await this.statsCards.count();
  }

  async navigateTo(menuItem: string) {
    await this.sidebar.locator(`text=${menuItem}`).click();
  }
}
