interface PagerDutyConfig { apiKey: string; serviceId: string; }

class PagerDutyClient {
  constructor(private config: PagerDutyConfig) {}
  async createIncident(title: string, urgency: string = 'high') {
    const res = await fetch('https://api.pagerduty.com/incidents', {
      method: 'POST',
      headers: { 'Authorization': `Token token=${this.config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident: { type: 'incident', title, service: { id: this.config.serviceId, type: 'service_reference' }, urgency } })
    });
    return res.json();
  }
}

export const pagerduty = new PagerDutyClient({ apiKey: process.env.PAGERDUTY_API_KEY || '', serviceId: process.env.PAGERDUTY_SERVICE_ID || '' });