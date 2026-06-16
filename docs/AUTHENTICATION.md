# Authentication Guide

## Overview

Authentication mechanisms and security practices.

## Authentication Methods

### 1. Email/Password

```typescript
// Login flow
async function login(email: string, password: string) {
  // Validate credentials
  const user = await findUserByEmail(email);
  if (!user) throw new AuthError("Invalid credentials");

  // Verify password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AuthError("Invalid credentials");

  // Check 2FA
  if (user.twoFactorEnabled) {
    return { requiresTwoFactor: true, tempToken: generateTempToken(user.id) };
  }

  // Generate tokens
  return generateAuthTokens(user);
}
```

### 2. OAuth 2.0 / SSO

```typescript
// Supported providers
const oauthProviders = {
  google: { clientId: process.env.GOOGLE_CLIENT_ID },
  microsoft: { clientId: process.env.AZURE_CLIENT_ID },
  okta: { domain: process.env.OKTA_DOMAIN },
};

// OAuth callback
async function handleOAuthCallback(provider: string, code: string) {
  const tokens = await exchangeCode(provider, code);
  const profile = await getProfile(provider, tokens.access_token);

  let user = await findUserByOAuthId(provider, profile.id);
  if (!user) {
    user = await createUser({ email: profile.email, provider, providerId: profile.id });
  }

  return generateAuthTokens(user);
}
```

### 3. Two-Factor Authentication

```typescript
// TOTP-based 2FA
import { authenticator } from "otplib";

// Enable 2FA
async function enableTwoFactor(userId: string) {
  const secret = authenticator.generateSecret();
  await updateUser(userId, { twoFactorSecret: encrypt(secret) });

  const otpauth = authenticator.keyuri(user.email, "Sentinela", secret);
  return { secret, qrCode: await QRCode.toDataURL(otpauth) };
}

// Verify 2FA token
async function verifyTwoFactor(userId: string, token: string) {
  const user = await findUser(userId);
  const secret = decrypt(user.twoFactorSecret);
  return authenticator.verify({ token, secret });
}
```

## Token Management

### JWT Structure

```typescript
// Access token (15 min expiry)
{
  sub: userId,
  org: organizationId,
  role: "admin",
  permissions: ["read:users", "write:users"],
  iat: timestamp,
  exp: timestamp + 900,
}

// Refresh token (7 days expiry)
{
  sub: userId,
  jti: tokenId,
  iat: timestamp,
  exp: timestamp + 604800,
}
```

### Token Refresh

```typescript
async function refreshTokens(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  // Check if token is revoked
  if (await isTokenRevoked(payload.jti)) {
    throw new AuthError("Token revoked");
  }

  // Generate new tokens
  const user = await findUser(payload.sub);
  return generateAuthTokens(user);
}
```

## Session Management

### Session Storage

```typescript
// Redis session store
const sessionStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
  ttl: 86400, // 24 hours
});
```

### Session Security

- HTTP-only cookies
- Secure flag in production
- SameSite=Strict
- CSRF protection
- Session fixation prevention

## Security Best Practices

1. **Password Requirements**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Check against breached password lists

2. **Rate Limiting**
   - 5 failed attempts: 15 min lockout
   - 10 failed attempts: Account lock

3. **Audit Logging**
   - All authentication events logged
   - IP address, user agent, location

## Related Documentation

- [AUTHORIZATION.md](./AUTHORIZATION.md)
- [ENCRYPTION.md](./ENCRYPTION.md)
- [SECURITY_PRACTICES.md](./SECURITY_PRACTICES.md)
