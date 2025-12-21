interface ZendeskConfig { subdomain: string; token: string; email: string; }

class ZendeskClient {
  private baseUrl: string;
  private auth: string;

  constructor(config: ZendeskConfig) {
    this.baseUrl = \`https://\${config.subdomain}.zendesk.com/api/v2\`;
    this.auth = btoa(\`\${config.email}/token:\${config.token}\`);
  }

  async createTicket(subject: string, description: string, priority = 'normal') {
    const response = await fetch(\`\${this.baseUrl}/tickets.json\`, {
      method: 'POST',
      headers: { 'Authorization': \`Basic \${this.auth}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket: { subject, description, priority } }),
    });
    return response.json();
  }

  async getTickets() {
    const response = await fetch(\`\${this.baseUrl}/tickets.json\`, {
      headers: { 'Authorization': \`Basic \${this.auth}\` },
    });
    return response.json();
  }
}

export const zendesk = new ZendeskClient({
  subdomain: process.env.ZENDESK_SUBDOMAIN || '',
  token: process.env.ZENDESK_TOKEN || '',
  email: process.env.ZENDESK_EMAIL || '',
});
