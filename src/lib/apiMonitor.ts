/**
 * API Response Time Monitor
 * Tracks Supabase query durations and alerts on slow responses.
 */

import { logger } from "@/lib/logger";

interface QueryMetric {
  table: string;
  operation: string;
  durationMs: number;
  timestamp: number;
  slow: boolean;
}

const SLOW_THRESHOLD_MS = 3000;
const VERY_SLOW_THRESHOLD_MS = 8000;
const MAX_HISTORY = 200;

class ApiResponseMonitor {
  private history: QueryMetric[] = [];
  private slowCount = 0;
  private totalCount = 0;

  /**
   * Record a query execution time.
   */
  record(table: string, operation: string, durationMs: number): QueryMetric {
    this.totalCount++;
    const slow = durationMs >= SLOW_THRESHOLD_MS;

    const metric: QueryMetric = {
      table,
      operation,
      durationMs: Math.round(durationMs),
      timestamp: Date.now(),
      slow,
    };

    if (slow) {
      this.slowCount++;
      const icon = durationMs >= VERY_SLOW_THRESHOLD_MS ? "🔴" : "🟡";
      logger.warn(`${icon} Slow query: ${operation} on ${table} took ${metric.durationMs}ms`);
    }

    this.history.push(metric);
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }

    return metric;
  }

  /**
   * Wrap an async Supabase call with timing.
   */
  async track<T>(table: string, operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.record(table, operation, performance.now() - start);
      return result;
    } catch (error) {
      this.record(table, `${operation}:error`, performance.now() - start);
      throw error;
    }
  }

  /**
   * Get performance summary.
   */
  getSummary() {
    const recent = this.history.slice(-50);
    const durations = recent.map((m) => m.durationMs);
    const avg =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
    const max = durations.length > 0 ? Math.max(...durations) : 0;
    const p95 =
      durations.length > 0
        ? durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)] || 0
        : 0;

    // Per-table breakdown
    const byTable = recent.reduce<Record<string, { count: number; avgMs: number; maxMs: number }>>(
      (acc, m) => {
        if (!acc[m.table]) acc[m.table] = { count: 0, avgMs: 0, maxMs: 0 };
        acc[m.table].count++;
        acc[m.table].avgMs += m.durationMs;
        acc[m.table].maxMs = Math.max(acc[m.table].maxMs, m.durationMs);
        return acc;
      },
      {}
    );

    Object.values(byTable).forEach((t) => {
      t.avgMs = Math.round(t.avgMs / t.count);
    });

    return {
      totalQueries: this.totalCount,
      slowQueries: this.slowCount,
      slowPercentage:
        this.totalCount > 0 ? Math.round((this.slowCount / this.totalCount) * 100) : 0,
      avgMs: avg,
      maxMs: max,
      p95Ms: p95,
      byTable,
    };
  }

  /** Get raw history */
  getHistory(): readonly QueryMetric[] {
    return this.history;
  }

  /** Clear all metrics */
  reset(): void {
    this.history = [];
    this.slowCount = 0;
    this.totalCount = 0;
  }
}

export const apiMonitor = new ApiResponseMonitor();

/**
 * Periodically check connectivity to Supabase and essential services.
 */
export async function runHealthCheck(): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = performance.now();
  try {
    const { error } = await (await import("@/integrations/supabase/client")).supabase
      .from("geofences")
      .select("id", { count: "estimated", head: true })
      .limit(1);

    const latency = Math.round(performance.now() - start);

    if (error) {
      logger.error("[HealthCheck] Failed:", error.message);
      return { ok: false, latency, error: error.message };
    }

    return { ok: true, latency };
  } catch (err) {
    const latency = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : "Unknown network error";
    logger.error("[HealthCheck] Exception:", msg);
    return { ok: false, latency, error: msg };
  }
}
