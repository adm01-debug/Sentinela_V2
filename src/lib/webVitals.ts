/**
 * Web Vitals — Core performance metrics tracking.
 * Reports LCP, FID, CLS, FCP, TTFB via PerformanceObserver API.
 */

import { logger } from './logger';

const log = logger.create('WebVitals');

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

type MetricCallback = (metric: WebVitalMetric) => void;

const thresholds: Record<string, [number, number]> = {
  LCP:  [2500, 4000],
  FID:  [100, 300],
  CLS:  [0.1, 0.25],
  FCP:  [1800, 3000],
  TTFB: [800, 1800],
};

function rate(name: string, value: number): WebVitalMetric['rating'] {
  const t = thresholds[name];
  if (!t) return 'good';
  if (value <= t[0]) return 'good';
  if (value <= t[1]) return 'needs-improvement';
  return 'poor';
}

function observe(type: string, name: string, cb: MetricCallback) {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (!last) return;

      const rawValue = name === 'CLS'
        ? entries.reduce((sum, e) => sum + ((e as PerformanceEntry & { value?: number }).value || 0), 0)
        : ('processingStart' in last ? (last as PerformanceEntry & { processingStart: number }).processingStart : last.startTime);

      const value = rawValue || 0;

      const metric: WebVitalMetric = {
        name,
        value: Math.round(name === 'CLS' ? value * 1000 : value) / (name === 'CLS' ? 1000 : 1),
        rating: rate(name, value),
        timestamp: Date.now(),
      };

      cb(metric);

      if (metric.rating === 'poor') {
        if (import.meta.env.PROD) {
          log.warn(`Poor ${name}: ${metric.value}`, { metric: metric as unknown as Record<string, unknown> });
        } else {
          log.debug(`Poor ${name}: ${metric.value}`, { metric: metric as unknown as Record<string, unknown> });
        }
      } else {
        log.debug(`${name}: ${metric.value} (${metric.rating})`, { metric: metric as unknown as Record<string, unknown> });
      }
    });

    observer.observe({ type, buffered: true });
  } catch {
    // PerformanceObserver not supported for this type
  }
}

/** Initialize Web Vitals tracking */
export function initWebVitals(onMetric?: MetricCallback) {
  const cb = onMetric ?? (() => {});

  observe('largest-contentful-paint', 'LCP', cb);
  observe('first-input', 'FID', cb);
  observe('layout-shift', 'CLS', cb);
  observe('paint', 'FCP', (metric) => {
    if (metric.name === 'FCP') cb(metric);
  });
  observe('navigation', 'TTFB', cb);

  log.info('Web Vitals tracking initialized');
}

/** Get current navigation timing summary */
export function getNavigationTiming(): Record<string, number> | null {
  if (typeof performance === 'undefined') return null;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!nav) return null;

  return {
    dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
    tcp: Math.round(nav.connectEnd - nav.connectStart),
    ttfb: Math.round(nav.responseStart - nav.requestStart),
    download: Math.round(nav.responseEnd - nav.responseStart),
    domParse: Math.round(nav.domInteractive - nav.responseEnd),
    domReady: Math.round(nav.domContentLoadedEventEnd - nav.fetchStart),
    load: Math.round(nav.loadEventEnd - nav.fetchStart),
  };
}

export type { WebVitalMetric, MetricCallback };
