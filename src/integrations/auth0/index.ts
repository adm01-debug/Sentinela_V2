interface Auth0Config { domain: string; clientId: string; clientSecret: string; }

class Auth0Client {
  constructor(private config: Auth0Config) {}
  async getToken() {
    const res = await fetch(`https://${this.config.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials', client_id: this.config.clientId, client_secret: this.config.clientSecret, audience: `https://${this.config.domain}/api/v2/` })
    });
    return res.json();
  }
}

export const auth0 = new Auth0Client({ domain: process.env.AUTH0_DOMAIN || '', clientId: process.env.AUTH0_CLIENT_ID || '', clientSecret: process.env.AUTH0_CLIENT_SECRET || '' });