interface PayPalConfig { clientId: string; clientSecret: string; }

class PayPalClient {
  constructor(private config: PayPalConfig) {}
  async getAccessToken() {
    const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
    const res = await fetch('https://api.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    return res.json();
  }
}

export const paypal = new PayPalClient({ clientId: process.env.PAYPAL_CLIENT_ID || '', clientSecret: process.env.PAYPAL_CLIENT_SECRET || '' });