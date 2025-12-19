/**
 * Error monitoring and logging configuration
 */

import * as Sentry from '@sentry/react';

// Initialize Sentry if DSN is provided
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initErrorMonitoring() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured, error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    
    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filter out non-actionable errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Ignore network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return null;
      }
      
      // Ignore user-cancelled requests
      if (error instanceof DOMException && error.name === 'AbortError') {
        return null;
      }
      
      return event;
    },
    
    // Ignore specific URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });
}

/**
 * Set user context for error tracking
 */
export function setErrorUser(user: { id: string; email?: string; name?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

/**
 * Clear user context on logout
 */
export function clearErrorUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.captureMessage(message, level);
}

/**
 * Web Vitals tracking
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  const reportWebVital = ({ name, value, id }: { name: string; value: number; id: string }) => {
    // Send to analytics
    console.log(`[Web Vital] ${name}: ${value}`);
    
    // Optional: Send to Sentry
    Sentry.addBreadcrumb({
      category: 'web-vital',
      message: `${name}: ${value}`,
      data: { name, value, id },
      level: 'info',
    });
  };

  // Use web-vitals library if available
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS(reportWebVital);
    onFID(reportWebVital);
    onFCP(reportWebVital);
    onLCP(reportWebVital);
    onTTFB(reportWebVital);
  }).catch(() => {
    // web-vitals not installed
  });
}
