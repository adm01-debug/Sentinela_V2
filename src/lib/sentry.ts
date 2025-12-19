// ============================================================
// SENTRY ERROR TRACKING CONFIGURATION
// Production-ready error monitoring and performance tracking
// ============================================================

import * as Sentry from '@sentry/react';

// ============================================================
// TYPES
// ============================================================

interface UserContext {
  id: string;
  email?: string;
  name?: string;
  company_id?: string;
  role?: string;
}

interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  // Don't initialize in development without DSN
  if (!dsn) {
    console.log('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text content for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter errors
    beforeSend(event, hint) {
      // Don't send errors in development
      if (environment === 'development') {
        console.error('[Sentry] Error captured:', hint.originalException);
        return null;
      }

      // Filter out known non-critical errors
      const error = hint.originalException as Error;
      if (error?.message) {
        // Network errors that are expected
        if (error.message.includes('Failed to fetch')) {
          return null;
        }
        // Auth errors (handled gracefully)
        if (error.message.includes('Invalid login credentials')) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.telefonika.com',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Generic errors
      'Script error.',
      'Network request failed',
      'ResizeObserver loop',
      'Non-Error promise rejection',
    ],

    // Deny URLs (browser extensions, etc.)
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });

  console.log('[Sentry] Initialized successfully');
}

// ============================================================
// USER CONTEXT
// ============================================================

export function setUser(user: UserContext | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });

    // Set additional context
    Sentry.setContext('user_details', {
      company_id: user.company_id,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
}

// ============================================================
// ERROR CAPTURING
// ============================================================

export function captureError(
  error: Error,
  context?: ErrorContext
): string {
  // Add context if provided
  if (context) {
    Sentry.setContext('error_context', {
      component: context.component,
      action: context.action,
      ...context.metadata,
    });
  }

  // Capture and return event ID
  return Sentry.captureException(error);
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): string {
  if (context) {
    Sentry.setContext('message_context', context);
  }

  return Sentry.captureMessage(message, level);
}

// ============================================================
// BREADCRUMBS
// ============================================================

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

// ============================================================
// PERFORMANCE TRACKING
// ============================================================

export function startTransaction(
  name: string,
  op: string
): ReturnType<typeof Sentry.startInactiveSpan> {
  return Sentry.startInactiveSpan({
    name,
    op,
    forceTransaction: true,
  });
}

export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const span = Sentry.startInactiveSpan({
    name,
    op: 'function',
  });

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => span?.end());
    }

    span?.end();
    return result;
  } catch (error) {
    span?.end();
    throw error;
  }
}

// ============================================================
// REACT ERROR BOUNDARY INTEGRATION
// ============================================================

export const SentryErrorBoundary = Sentry.ErrorBoundary;

export function withSentryProfiler<P extends object>(
  Component: React.ComponentType<P>,
  name?: string
) {
  return Sentry.withProfiler(Component, { name });
}

// ============================================================
// HOOKS
// ============================================================

export function useSentryTransaction(name: string, op: string) {
  const transactionRef = React.useRef<ReturnType<typeof startTransaction>>();

  React.useEffect(() => {
    transactionRef.current = startTransaction(name, op);

    return () => {
      transactionRef.current?.end();
    };
  }, [name, op]);

  return transactionRef.current;
}

// Import React for hooks
import React from 'react';

// ============================================================
// EXPORTS
// ============================================================

export { Sentry };
