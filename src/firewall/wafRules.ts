export interface WAFRule { id: string; name: string; pattern: RegExp; action: 'block' | 'allow' | 'log'; priority: number; }
export class WAFRules {
  private rules: WAFRule[] = [];
  add(rule: WAFRule): void { this.rules.push(rule); this.rules.sort((a, b) => b.priority - a.priority); }
  remove(id: string): boolean { const idx = this.rules.findIndex(r => r.id === id); if (idx >= 0) { this.rules.splice(idx, 1); return true; } return false; }
  match(input: string): WAFRule | null { return this.rules.find(r => r.pattern.test(input)) || null; }
  getAll(): WAFRule[] { return [...this.rules]; }
}
export const wafRules = new WAFRules();
