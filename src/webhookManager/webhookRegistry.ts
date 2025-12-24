export interface Webhook { id: string; url: string; events: string[]; secret?: string; active: boolean; createdAt: Date; lastTriggered?: Date; }
export class WebhookRegistry {
  private webhooks = new Map<string, Webhook>();
  register(url: string, events: string[], secret?: string): Webhook { const webhook: Webhook = { id: crypto.randomUUID(), url, events, secret, active: true, createdAt: new Date() }; this.webhooks.set(webhook.id, webhook); return webhook; }
  unregister(id: string): boolean { return this.webhooks.delete(id); }
  get(id: string): Webhook | undefined { return this.webhooks.get(id); }
  getByEvent(event: string): Webhook[] { return Array.from(this.webhooks.values()).filter(w => w.active && w.events.includes(event)); }
  list(): Webhook[] { return Array.from(this.webhooks.values()); }
  setActive(id: string, active: boolean): void { const wh = this.webhooks.get(id); if (wh) wh.active = active; }
}
export const webhookRegistry = new WebhookRegistry();
