export interface HoneyToken { id: string; type: 'api_key' | 'password' | 'file' | 'url'; value: string; createdAt: Date; triggered: boolean; triggeredAt?: Date; triggeredBy?: string; }
export class HoneyTokenManager {
  private tokens = new Map<string, HoneyToken>();
  create(type: HoneyToken['type']): HoneyToken { const token: HoneyToken = { id: crypto.randomUUID(), type, value: this.generateValue(type), createdAt: new Date(), triggered: false }; this.tokens.set(token.id, token); return token; }
  private generateValue(type: HoneyToken['type']): string { const base = crypto.randomUUID().replace(/-/g, ''); switch (type) { case 'api_key': return 'sk_live_' + base; case 'password': return 'P@ss_' + base.slice(0, 16); default: return base; } }
  trigger(id: string, triggeredBy: string): void { const token = this.tokens.get(id); if (token) { token.triggered = true; token.triggeredAt = new Date(); token.triggeredBy = triggeredBy; } }
  getTriggered(): HoneyToken[] { return Array.from(this.tokens.values()).filter(t => t.triggered); }
}
export const honeyTokenManager = new HoneyTokenManager();
