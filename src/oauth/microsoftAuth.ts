import { OAuthProvider, OAuthConfig, OAuthTokens } from './oauthProvider';
export class MicrosoftAuth extends OAuthProvider {
  private tenant = 'common';
  constructor(config: OAuthConfig, tenant = 'common') { super(config); this.tenant = tenant; }
  getAuthUrl(): string { const params = new URLSearchParams({ client_id: this.config.clientId, redirect_uri: this.config.redirectUri, response_type: 'code', scope: this.config.scope.join(' '), response_mode: 'query' }); return 'https://login.microsoftonline.com/' + this.tenant + '/oauth2/v2.0/authorize?' + params; }
  async exchangeCode(code: string): Promise<OAuthTokens> { const response = await fetch('https://login.microsoftonline.com/' + this.tenant + '/oauth2/v2.0/token', { method: 'POST', body: new URLSearchParams({ code, client_id: this.config.clientId, client_secret: this.config.clientSecret, redirect_uri: this.config.redirectUri, grant_type: 'authorization_code' }) }); const data = await response.json(); return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in }; }
  async refreshToken(token: string): Promise<OAuthTokens> { const response = await fetch('https://login.microsoftonline.com/' + this.tenant + '/oauth2/v2.0/token', { method: 'POST', body: new URLSearchParams({ refresh_token: token, client_id: this.config.clientId, client_secret: this.config.clientSecret, grant_type: 'refresh_token' }) }); const data = await response.json(); return { accessToken: data.access_token, expiresIn: data.expires_in }; }
  async getUserInfo(accessToken: string): Promise<any> { const response = await fetch('https://graph.microsoft.com/v1.0/me', { headers: { Authorization: 'Bearer ' + accessToken } }); return response.json(); }
}
