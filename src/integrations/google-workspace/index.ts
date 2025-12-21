interface GWSConfig { clientId: string; clientSecret: string; }

class GoogleWorkspaceClient {
  constructor(private config: GWSConfig) {}
  getAuthUrl(redirectUri: string) {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.config.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile`;
  }
}

export const googleWorkspace = new GoogleWorkspaceClient({ clientId: process.env.GOOGLE_CLIENT_ID || '', clientSecret: process.env.GOOGLE_CLIENT_SECRET || '' });