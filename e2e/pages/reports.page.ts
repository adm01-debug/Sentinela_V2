import { Page, Locator, expect } from "@playwright/test";

export class ReportsPage {
  readonly page: Page;
  readonly reportsList: Locator;
  readonly generateButton: Locator;
  readonly exportButton: Locator;
  readonly dateRangePicker: Locator;

  constructor(page: Page) {
    this.page = page;
    this.reportsList = page.locator("[data-testid='reports-list']");
    this.generateButton = page.locator("button:has-text('Generate')");
    this.exportButton = page.locator("button:has-text('Export')");
    this.dateRangePicker = page.locator("[data-testid='date-range']");
  }

  async goto() {
    await this.page.goto("/reports");
  }

  async selectDateRange(start: string, end: string) {
    await this.dateRangePicker.click();
    await this.page.fill("input[name='start']", start);
    await this.page.fill("input[name='end']", end);
  }

  async generate() {
    await this.generateButton.click();
  }

  async export(format: "pdf" | "csv" | "xlsx") {
    await this.exportButton.click();
    await this.page.click(`text=${format.toUpperCase()}`);
  }
}
