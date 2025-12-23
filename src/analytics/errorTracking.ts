export function trackError(error: Error, context?: Record<string, any>) {
  console.error('[Error]', error.message, context);
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, { extra: context });
  }
}

export function trackWarning(message: string, context?: Record<string, any>) {
  console.warn('[Warning]', message, context);
}
