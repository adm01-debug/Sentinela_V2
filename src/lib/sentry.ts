import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking
 * Only initializes in production or when SENTRY_DSN is configured
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Only initialize if DSN is configured
  if (!dsn || import.meta.env.DEV) {
    if (import.meta.env.DEV) {
      console.log('[Sentry] Skipping initialization in development mode');
    }
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Environment
    environment: import.meta.env.MODE,
  });
}

/**
 * Capture exception manually
 */
export function captureException(error: Error | unknown, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.error('[Sentry] Would capture:', error, context);
    return;
  }
  
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (user) {
    Sentry.setUser(user);
  } else {
    Sentry.setUser(null);
  }
}