# Configuration Guide

Complete configuration options for Sentinela.

## Environment Variables

### Required
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional
```env
VITE_APP_NAME=Sentinela
VITE_APP_URL=https://app.sentinela.com
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Feature Flags
```env
VITE_FEATURE_SCREENSHOTS=true
VITE_FEATURE_GEOFENCING=true
VITE_FEATURE_AI_ANALYSIS=false
```

## Monitoring Settings
```javascript
// config/monitoring.ts
export const monitoringConfig = {
  screenshotInterval: 300, // seconds
  activityInterval: 60,
  idleTimeout: 180,
};
```

## Security Settings
```javascript
// config/security.ts
export const securityConfig = {
  sessionTimeout: 3600,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  require2FA: false,
};
```

## Customization
- Themes: `src/themes/`
- Locales: `src/i18n/locales/`
- Branding: `public/`
