# SSO Setup Guide

## Supported Providers

- Okta
- Azure AD
- Google Workspace
- OneLogin

## SAML Configuration

1. Get metadata URL from your IdP
2. Settings > Security > SSO > Add Provider
3. Enter Entity ID and ACS URL
4. Upload IdP certificate

## Attribute Mapping

```
email -> user.email
firstName -> user.given_name
lastName -> user.family_name
department -> user.department
```

## Testing

Use SAML Tracer browser extension to debug.
