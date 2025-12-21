interface FreshdeskConfig { domain: string; apiKey: string; }

class FreshdeskClient {
  constructor(private config: FreshdeskConfig) {}
  async createTicket(subject: string, description: string, email: string) {
    const auth = btoa(`${this.config.apiKey}:X`);
    const res = await fetch(`https://${this.config.domain}.freshdesk.com/api/v2/tickets`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description, email, priority: 1, status: 2 })
    });
    return res.json();
  }
}

export const freshdesk = new FreshdeskClient({ domain: process.env.FRESHDESK_DOMAIN || '', apiKey: process.env.FRESHDESK_API_KEY || '' });