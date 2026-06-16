// ============================================================
// ERROR TRACKER - Centralized error collection & reporting
// Captures unhandled errors, promise rejections, and manual reports
// ============================================================

import * as Sentry from "@sentry/react";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

// ============================================================
// TYPES
// ============================================================

interface ErrorReport {
  message: string;
  stack?: string;
  component?: string;
  context?: Record<string, unknown>;
  severity: "low" | "medium" | "high" | "critical";
  url: string;
  userAgent: string;
  timestamp: string;
}

interface ErrorTrackerConfig {
  maxQueueSize: number;
  flushIntervalMs: number;
  sampleRate: number; // 0-1, percentage of errors to track
}

// ============================================================
// ERROR TRACKER
// ============================================================

const DEFAULT_CONFIG: ErrorTrackerConfig = {
  maxQueueSize: 50,
  flushIntervalMs: 30000,
  sampleRate: 1.0,
};

class ErrorTracker {
  private queue: ErrorReport[] = [];
  private config: ErrorTrackerConfig;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized = false;
  private seenErrors = new Set<string>();

  constructor(config: Partial<ErrorTrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Initialize Sentry
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
        // Performance Monitoring
        tracesSampleRate: 1.0,
        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        environment: import.meta.env.MODE,
      });
      logger.info("[ErrorTracker] Sentry Initialized");
    }

    // Global error handler (Native fallback)
    window.addEventListener("error", (event) => {
      this.captureError(event.error ?? new Error(event.message), {
        component: "window.onerror",
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejections (Native fallback)
    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.captureError(error, {
        component: "unhandledrejection",
        severity: "high",
      });
    });

    // Periodic flush (to internal logs)
    this.flushTimer = setInterval(() => this.flush(), this.config.flushIntervalMs);

    logger.info("[ErrorTracker] Native collection initialized");
  }

  captureError(
    error: Error,
    options: {
      component?: string;
      context?: Record<string, unknown>;
      severity?: ErrorReport["severity"];
    } = {}
  ): void {
    // Sampling
    if (Math.random() > this.config.sampleRate) return;

    // Dedup by message + stack fingerprint
    const fingerprint = `${error.message}::${error.stack?.slice(0, 200) ?? ""}`;
    if (this.seenErrors.has(fingerprint)) return;
    this.seenErrors.add(fingerprint);

    // Keep seen set bounded
    if (this.seenErrors.size > 500) {
      const entries = Array.from(this.seenErrors);
      entries.slice(0, 250).forEach((e) => this.seenErrors.delete(e));
    }

    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      component: options.component,
      context: options.context,
      severity: options.severity ?? this.classifySeverity(error),
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Forward to Sentry
    Sentry.captureException(error, {
      extra: options.context,
      tags: {
        component: options.component,
        severity: report.severity,
      },
    });

    this.queue.push(report);
    logger.error(`[ErrorTracker] Captured: ${report.message}`, report.component ?? "");

    // Auto-flush if queue is full
    if (this.queue.length >= this.config.maxQueueSize) {
      this.flush();
    }
  }

  private classifySeverity(error: Error): ErrorReport["severity"] {
    const msg = error.message.toLowerCase();
    if (msg.includes("chunk") || msg.includes("loading")) return "medium";
    if (msg.includes("network") || msg.includes("fetch")) return "high";
    if (msg.includes("security") || msg.includes("auth")) return "critical";
    return "medium";
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    // Load pending from storage
    const stored = localStorage.getItem("sentinela_pending_errors");
    let pending: ErrorReport[] = [];
    try {
      if (stored) pending = JSON.parse(stored);
    } catch (e) {
      logger.warn("[ErrorTracker] Failed to parse pending errors from localStorage");
    }

    const batch = [...pending, ...this.queue.splice(0, this.config.maxQueueSize)];
    if (batch.length === 0) return;

    try {
      const { error } = await supabase.from("error_reports").insert(
        batch.map((r) => ({
          message: r.message,
          stack: r.stack ?? null,
          component: r.component ?? null,
          context: r.context ?? null,
          severity: r.severity,
          url: r.url,
          user_agent: r.userAgent,
          occurred_at: r.timestamp,
        }))
      );

      if (error) {
        logger.warn("[ErrorTracker] Failed to persist errors, saving locally:", error.message);
        localStorage.setItem("sentinela_pending_errors", JSON.stringify(batch.slice(-50)));
      } else {
        localStorage.removeItem("sentinela_pending_errors");
      }
    } catch {
      logger.warn("[ErrorTracker] Flush failed, saving locally");
      localStorage.setItem("sentinela_pending_errors", JSON.stringify(batch.slice(-50)));
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
    this.initialized = false;
  }
}

// Singleton
export const errorTracker = new ErrorTracker();

/**
 * Initialize error tracking - call once in main.tsx
 */
export function initErrorTracking(): void {
  errorTracker.init();
}

/**
 * Manually capture an error with context
 */
export function captureError(
  error: Error,
  options?: {
    component?: string;
    context?: Record<string, unknown>;
    severity?: ErrorReport["severity"];
  }
): void {
  errorTracker.captureError(error, options);
}
