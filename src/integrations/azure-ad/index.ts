interface AzureADConfig { tenantId: string; clientId: string; }

class AzureADClient {
  constructor(private config: AzureADConfig) {}
  getLoginUrl(redirectUri: string) {
    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?client_id=${this.config.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid profile email`;
  }
}

export const azureAD = new AzureADClient({ tenantId: process.env.AZURE_AD_TENANT_ID || '', clientId: process.env.AZURE_AD_CLIENT_ID || '' });