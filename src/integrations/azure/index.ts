interface AzureConfig { tenantId: string; clientId: string; clientSecret: string; }

class AzureClient {
  constructor(private config: AzureConfig) {}
  async getToken() {
    const res = await fetch(`https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: this.config.clientId, client_secret: this.config.clientSecret, scope: 'https://graph.microsoft.com/.default' })
    });
    return res.json();
  }
}

export const azure = new AzureClient({ tenantId: process.env.AZURE_TENANT_ID || '', clientId: process.env.AZURE_CLIENT_ID || '', clientSecret: process.env.AZURE_CLIENT_SECRET || '' });