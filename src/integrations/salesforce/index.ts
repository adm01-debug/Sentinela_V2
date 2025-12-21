interface SalesforceConfig { instanceUrl: string; accessToken: string; }

class SalesforceClient {
  constructor(private config: SalesforceConfig) {}
  async createLead(data: Record<string, unknown>) {
    const res = await fetch(`${this.config.instanceUrl}/services/data/v58.0/sobjects/Lead`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.config.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
}

export const salesforce = new SalesforceClient({ instanceUrl: process.env.SF_INSTANCE_URL || '', accessToken: process.env.SF_ACCESS_TOKEN || '' });