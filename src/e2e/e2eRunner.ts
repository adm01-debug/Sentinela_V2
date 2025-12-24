export interface E2ETestCase { name: string; steps: (() => Promise<void>)[]; }
export interface E2EResult { name: string; passed: boolean; duration: number; error?: string; }
export class E2ERunner {
  private tests: E2ETestCase[] = [];
  addTest(test: E2ETestCase): void { this.tests.push(test); }
  async runAll(): Promise<E2EResult[]> { const results: E2EResult[] = []; for (const test of this.tests) { const start = Date.now(); try { for (const step of test.steps) await step(); results.push({ name: test.name, passed: true, duration: Date.now() - start }); } catch (e) { results.push({ name: test.name, passed: false, duration: Date.now() - start, error: String(e) }); } } return results; }
  async run(name: string): Promise<E2EResult | null> { const test = this.tests.find(t => t.name === name); if (!test) return null; return (await this.runAll()).find(r => r.name === name) || null; }
}
export const e2eRunner = new E2ERunner();
