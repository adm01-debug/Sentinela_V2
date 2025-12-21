interface OpsgenieConfig { apiKey: string; }

class OpsgenieClient {
  constructor(private config: OpsgenieConfig) {}
  async createAlert(message: string, priority: string = 'P3') {
    const res = await fetch('https://api.opsgenie.com/v2/alerts', {
      method: 'POST',
      headers: { 'Authorization': `GenieKey ${this.config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, priority })
    });
    return res.json();
  }
}

export const opsgenie = new OpsgenieClient({ apiKey: process.env.OPSGENIE_API_KEY || '' });