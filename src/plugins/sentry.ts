import * as Sentry from '@sentry/react';
export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: import.meta.env.MODE, tracesSampleRate: 0.1, replaysSessionSampleRate: 0.1, replaysOnErrorSampleRate: 1.0 });
  }
}
export function captureException(error: Error, context?: Record<string, any>) { Sentry.captureException(error, { extra: context }); }
export function setUser(user: { id: string; email: string }) { Sentry.setUser(user); }
