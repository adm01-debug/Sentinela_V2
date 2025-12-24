export interface TransformRule { type: 'header' | 'body' | 'query'; action: 'add' | 'remove' | 'modify'; key: string; value?: string; }
export class RequestTransformer {
  private rules: TransformRule[] = [];
  addRule(rule: TransformRule): void { this.rules.push(rule); }
  transform(request: { headers: Record<string, string>; body: any; query: Record<string, string> }): typeof request { for (const rule of this.rules) { switch (rule.type) { case 'header': if (rule.action === 'add') request.headers[rule.key] = rule.value || ''; if (rule.action === 'remove') delete request.headers[rule.key]; break; case 'body': if (rule.action === 'add') request.body[rule.key] = rule.value; if (rule.action === 'remove') delete request.body[rule.key]; break; case 'query': if (rule.action === 'add') request.query[rule.key] = rule.value || ''; if (rule.action === 'remove') delete request.query[rule.key]; break; } } return request; }
  clearRules(): void { this.rules = []; }
}
export const requestTransformer = new RequestTransformer();
