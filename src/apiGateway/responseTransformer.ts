export interface ResponseTransformRule { type: 'header' | 'body' | 'status'; action: 'add' | 'remove' | 'modify'; key: string; value?: any; }
export class ResponseTransformer {
  private rules: ResponseTransformRule[] = [];
  addRule(rule: ResponseTransformRule): void { this.rules.push(rule); }
  transform(response: { headers: Record<string, string>; body: any; status: number }): typeof response { for (const rule of this.rules) { switch (rule.type) { case 'header': if (rule.action === 'add') response.headers[rule.key] = rule.value; if (rule.action === 'remove') delete response.headers[rule.key]; break; case 'body': if (rule.action === 'add') response.body[rule.key] = rule.value; if (rule.action === 'remove') delete response.body[rule.key]; break; case 'status': if (rule.action === 'modify') response.status = rule.value; break; } } return response; }
  clearRules(): void { this.rules = []; }
}
export const responseTransformer = new ResponseTransformer();
