export class ZapierClient {
  private webhookUrl: string;
  
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }
  
  async trigger(data: Record<string, any>): Promise<void> {
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

export function createZapierWebhook(eventType: string) {
  return (data: any) => ({ event: eventType, timestamp: new Date().toISOString(), data });
}
