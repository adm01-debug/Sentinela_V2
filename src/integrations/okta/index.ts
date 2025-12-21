interface OktaConfig { domain: string; clientId: string; }

class OktaClient {
  constructor(private config: OktaConfig) {}
  getLoginUrl(redirectUri: string) {
    return `https://${this.config.domain}/oauth2/default/v1/authorize?client_id=${this.config.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid profile email`;
  }
}

export const okta = new OktaClient({ domain: process.env.OKTA_DOMAIN || '', clientId: process.env.OKTA_CLIENT_ID || '' });