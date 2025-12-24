export const e2eHelpers = {
  async waitForElement(selector: string, timeout = 5000): Promise<Element | null> { const start = Date.now(); while (Date.now() - start < timeout) { const el = document.querySelector(selector); if (el) return el; await new Promise(r => setTimeout(r, 100)); } return null; },
  async click(selector: string): Promise<void> { const el = await this.waitForElement(selector); if (el) (el as HTMLElement).click(); },
  async type(selector: string, text: string): Promise<void> { const el = await this.waitForElement(selector) as HTMLInputElement; if (el) { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); } },
  async getText(selector: string): Promise<string> { const el = await this.waitForElement(selector); return el?.textContent || ''; },
  delay: (ms: number) => new Promise(r => setTimeout(r, ms)),
};
