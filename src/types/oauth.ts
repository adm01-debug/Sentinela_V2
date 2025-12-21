export interface OAuthProvider {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'github' | 'okta' | 'auth0';
  clientId: string;
  enabled: boolean;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  scope: string[];
}