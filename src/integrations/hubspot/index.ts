interface HubSpotConfig { apiKey: string; }

class HubSpotClient {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor(config: HubSpotConfig) { this.apiKey = config.apiKey; }

  async createContact(email: string, properties?: Record<string, string>) {
    const response = await fetch(\`\${this.baseUrl}/crm/v3/objects/contacts\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties: { email, ...properties } }),
    });
    return response.json();
  }

  async createDeal(dealname: string, amount: number, pipeline?: string) {
    const response = await fetch(\`\${this.baseUrl}/crm/v3/objects/deals\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties: { dealname, amount: amount.toString(), pipeline } }),
    });
    return response.json();
  }
}

export const hubspot = new HubSpotClient({ apiKey: process.env.HUBSPOT_API_KEY || '' });
