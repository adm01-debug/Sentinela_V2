import * as Sentry from '@sentry/react';

interface SentryConfig {
  dsn: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

export function initSentry(config: SentryConfig) {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment || process.env.NODE_ENV,
    release: config.release,
    tracesSampleRate: config.tracesSampleRate ?? 0.1,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string; username?: string } | null) {
  Sentry.setUser(user);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
