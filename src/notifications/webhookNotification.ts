interface WebhookPayload { event: string; data: any; timestamp: string; }
export async function sendWebhook(url: string, payload: WebhookPayload): Promise<boolean> {
  try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); return true; } catch { return false; }
}
export function createWebhookPayload(event: string, data: any): WebhookPayload {
  return { event, data, timestamp: new Date().toISOString() };
}
