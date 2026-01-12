import { Page, Locator, expect } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;
  readonly tabs: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tabs = page.locator("[role='tablist']");
    this.saveButton = page.locator("button:has-text('Save')");
    this.cancelButton = page.locator("button:has-text('Cancel')");
  }

  async goto() {
    await this.page.goto("/settings");
  }

  async selectTab(name: string) {
    await this.tabs.locator(`text=${name}`).click();
  }

  async save() {
    await this.saveButton.click();
  }

  async updateProfile(data: { name?: string; email?: string }) {
    if (data.name) await this.page.fill("input[name='name']", data.name);
    if (data.email) await this.page.fill("input[name='email']", data.email);
    await this.save();
  }
}
