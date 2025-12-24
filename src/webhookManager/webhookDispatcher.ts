import { webhookRegistry, Webhook } from './webhookRegistry';
export interface WebhookPayload { event: string; data: any; timestamp: Date; }
export interface DispatchResult { webhook: Webhook; success: boolean; statusCode?: number; error?: string; }
export class WebhookDispatcher {
  async dispatch(event: string, data: any): Promise<DispatchResult[]> { const webhooks = webhookRegistry.getByEvent(event); const payload: WebhookPayload = { event, data, timestamp: new Date() }; const results: DispatchResult[] = []; for (const wh of webhooks) { try { const res = await fetch(wh.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); results.push({ webhook: wh, success: res.ok, statusCode: res.status }); } catch (e) { results.push({ webhook: wh, success: false, error: String(e) }); } } return results; }
  async dispatchSingle(webhookId: string, data: any): Promise<DispatchResult | null> { const wh = webhookRegistry.get(webhookId); if (!wh) return null; return (await this.dispatch(wh.events[0], data))[0]; }
}
export const webhookDispatcher = new WebhookDispatcher();
