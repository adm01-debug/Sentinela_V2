# Environment Configuration

## Overview

Sentinela uses environment variables for configuration.

## Environment Files

| File | Purpose |
|------|---------|
| `.env` | Local development (git-ignored) |
| `.env.example` | Template with all variables |
| `.env.local` | Local overrides |
| `.env.production` | Production values |

## Required Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_URL=https://api.sentinela.app

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
```

## Optional Variables

```bash
# Mapbox (for geofencing)
VITE_MAPBOX_TOKEN=your-mapbox-token

# Sentry (error tracking)
VITE_SENTRY_DSN=your-sentry-dsn

# WhatsApp Integration
VITE_WHATSAPP_API_URL=https://api.whatsapp.com
```

## Accessing Variables

```typescript
// In application code
const apiUrl = import.meta.env.VITE_API_URL;

// Type-safe access
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
}
```

## Security Notes

- Never commit `.env` files
- Use secrets manager in production
- Rotate keys regularly
- Audit access to production secrets
