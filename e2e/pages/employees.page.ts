import { Page, Locator, expect } from "@playwright/test";

export class EmployeesPage {
  readonly page: Page;
  readonly table: Locator;
  readonly searchInput: Locator;
  readonly addButton: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator("[data-testid='employees-table']");
    this.searchInput = page.locator("input[placeholder*='Search']");
    this.addButton = page.locator("button:has-text('Add Employee')");
    this.filterDropdown = page.locator("[data-testid='filter-dropdown']");
  }

  async goto() {
    await this.page.goto("/employees");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async addEmployee(data: { name: string; email: string }) {
    await this.addButton.click();
    await this.page.fill("input[name='name']", data.name);
    await this.page.fill("input[name='email']", data.email);
    await this.page.click("button:has-text('Save')");
  }

  async getRowCount() {
    return await this.table.locator("tbody tr").count();
  }
}
