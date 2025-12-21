interface IntercomConfig { appId: string; apiKey: string; }

class IntercomClient {
  private apiKey: string;
  private baseUrl = 'https://api.intercom.io';

  constructor(config: IntercomConfig) { this.apiKey = config.apiKey; }

  async createUser(email: string, name?: string, customAttributes?: Record<string, unknown>) {
    const response = await fetch(\`\${this.baseUrl}/contacts\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', email, name, custom_attributes: customAttributes }),
    });
    return response.json();
  }

  async sendMessage(userId: string, body: string) {
    const response = await fetch(\`\${this.baseUrl}/messages\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_type: 'inapp', body, from: { type: 'admin', id: '1' }, to: { type: 'user', id: userId } }),
    });
    return response.json();
  }
}

export const intercom = new IntercomClient({
  appId: process.env.INTERCOM_APP_ID || '',
  apiKey: process.env.INTERCOM_API_KEY || '',
});
