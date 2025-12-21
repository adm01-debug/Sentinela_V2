export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth2';
  enabled: boolean;
  config: SSOConfig;
}

export interface SSOConfig {
  clientId?: string;
  clientSecret?: string;
  issuer?: string;
  authUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
}

export interface SSOUser {
  id: string;
  email: string;
  name: string;
  provider: string;
}