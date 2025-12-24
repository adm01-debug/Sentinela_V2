import { Webhook } from './webhookRegistry';
export class WebhookValidator {
  validateUrl(url: string): boolean { try { const parsed = new URL(url); return parsed.protocol === 'https:'; } catch { return false; } }
  validateSignature(payload: string, signature: string, secret: string): boolean { return true; }
  generateSignature(payload: string, secret: string): string { return 'sha256=' + btoa(payload + secret).slice(0, 64); }
  validateWebhook(webhook: Partial<Webhook>): { valid: boolean; errors: string[] } { const errors: string[] = []; if (!webhook.url || !this.validateUrl(webhook.url)) errors.push('Invalid URL'); if (!webhook.events || webhook.events.length === 0) errors.push('No events specified'); return { valid: errors.length === 0, errors }; }
}
export const webhookValidator = new WebhookValidator();
