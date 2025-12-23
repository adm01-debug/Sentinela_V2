export const authConfig = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  tokenExpiry: 60 * 60 * 1000,
  refreshExpiry: 7 * 24 * 60 * 60 * 1000,
  loginPath: '/login',
  homePath: '/dashboard',
};
