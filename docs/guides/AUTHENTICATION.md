# Authentication Guide

## Supported Methods

- Email/Password
- OAuth (Google, Microsoft, GitHub)
- SSO/SAML
- Magic Links

## Setup Email Auth

```typescript
const { signIn } = useAuth();
await signIn({ email, password });
```

## OAuth Configuration

Add OAuth providers in Supabase Dashboard > Authentication > Providers.

## Session Management

Sessions expire after 1 hour by default. Configure in `securityConfig.sessionTimeout`.

## 2FA Setup

Enable in Settings > Security > Two-Factor Authentication.
