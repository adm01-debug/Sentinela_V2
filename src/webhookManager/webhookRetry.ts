import { Webhook } from './webhookRegistry';
export interface RetryConfig { maxRetries: number; backoffMs: number; backoffMultiplier: number; }
export interface PendingRetry { webhook: Webhook; payload: any; attempts: number; nextRetry: Date; }
export class WebhookRetry {
  private config: RetryConfig = { maxRetries: 3, backoffMs: 1000, backoffMultiplier: 2 };
  private pending: PendingRetry[] = [];
  configure(config: Partial<RetryConfig>): void { Object.assign(this.config, config); }
  schedule(webhook: Webhook, payload: any, attempts: number): void { if (attempts >= this.config.maxRetries) return; const delay = this.config.backoffMs * Math.pow(this.config.backoffMultiplier, attempts); this.pending.push({ webhook, payload, attempts: attempts + 1, nextRetry: new Date(Date.now() + delay) }); }
  getReady(): PendingRetry[] { const now = new Date(); return this.pending.filter(p => p.nextRetry <= now); }
  remove(webhook: Webhook): void { this.pending = this.pending.filter(p => p.webhook.id !== webhook.id); }
  getPending(): PendingRetry[] { return [...this.pending]; }
}
export const webhookRetry = new WebhookRetry();
