import * as Sentry from '@sentry/react';

export function initSentry(dsn: string, environment: string = 'production'): void {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function captureException(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string; username?: string }): void {
  Sentry.setUser(user);
}
