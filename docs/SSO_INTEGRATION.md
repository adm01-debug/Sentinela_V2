# SSO Integration Guide

## Supported Providers

- Google Workspace
- Microsoft Azure AD
- Okta
- SAML 2.0

## Configuration

### Google Workspace

1. Create OAuth credentials
2. Configure consent screen
3. Add authorized domains
4. Copy Client ID/Secret

### Azure AD

1. Register application
2. Configure redirect URIs
3. Generate client secret
4. Set permissions

## Implementation

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://app.sentinela.com/auth/callback',
  },
});
```

## SAML Configuration

```xml
<EntityDescriptor entityID="sentinela">
  <SPSSODescriptor>
    <AssertionConsumerService
      Location="https://api.sentinela.com/auth/saml/callback"
    />
  </SPSSODescriptor>
</EntityDescriptor>
```

## User Provisioning

- Just-in-time provisioning
- SCIM 2.0 support
- Group mapping
