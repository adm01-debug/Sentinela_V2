interface ZohoConfig { clientId: string; clientSecret: string; refreshToken: string; }

class ZohoClient {
  constructor(private config: ZohoConfig) {}
  async getAccessToken() {
    const res = await fetch(`https://accounts.zoho.com/oauth/v2/token?refresh_token=${this.config.refreshToken}&client_id=${this.config.clientId}&client_secret=${this.config.clientSecret}&grant_type=refresh_token`, { method: 'POST' });
    return res.json();
  }
}

export const zoho = new ZohoClient({ clientId: process.env.ZOHO_CLIENT_ID || '', clientSecret: process.env.ZOHO_CLIENT_SECRET || '', refreshToken: process.env.ZOHO_REFRESH_TOKEN || '' });