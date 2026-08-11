/**
 * Performance budget monitoring - warns when thresholds are exceeded.
 * Only active in development mode.
 */

import { logger } from '@/lib/logger';

interface PerformanceBudget {
  /** Max JS bundle size in KB */
  maxBundleSizeKB: number;
  /** Max time to interactive in ms */
  maxTTI: number;
  /** Max first contentful paint in ms */
  maxFCP: number;
  /** Max largest contentful paint in ms */
  maxLCP: number;
  /** Max cumulative layout shift */
  maxCLS: number;
  /** Max DOM nodes */
  maxDOMNodes: number;
  /** Max React re-renders per component per second */
  maxRendersPerSecond: number;
}

const BUDGET: PerformanceBudget = {
  maxBundleSizeKB: 500,
  maxTTI: 5000,
  maxFCP: 2000,
  maxLCP: 4000,
  maxCLS: 0.15,
  maxDOMNodes: 5000,
  maxRendersPerSecond: 50,
};

// Module-level handles — stored here so hot reload re-initializes cleanly.
let _webVitalsObserver: PerformanceObserver | null = null;
let _auditInterval: ReturnType<typeof setInterval> | null = null;

interface BudgetViolation {
  metric: string;
  value: number;
  budget: number;
  unit: string;
  severity: 'warning' | 'critical';
}

function checkDOMBudget(): BudgetViolation | null {
  const nodeCount = document.querySelectorAll('*').length;
  if (nodeCount > BUDGET.maxDOMNodes) {
    return {
      metric: 'DOM Nodes',
      value: nodeCount,
      budget: BUDGET.maxDOMNodes,
      unit: 'nodes',
      severity: nodeCount > BUDGET.maxDOMNodes * 1.5 ? 'critical' : 'warning',
    };
  }
  return null;
}

function checkWebVitals(): void {
  if (!('PerformanceObserver' in window)) return;

  const lastWarned: Record<string, number> = {};

  // Disconnect any previous observer before creating a new one (prevents stacking on HMR hot reload)
  if (_webVitalsObserver) { _webVitalsObserver.disconnect(); _webVitalsObserver = null; }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const violations: BudgetViolation[] = [];

        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          if (lcp > BUDGET.maxLCP) {
            violations.push({
              metric: 'LCP',
              value: Math.round(lcp),
              budget: BUDGET.maxLCP,
              unit: 'ms',
              severity: lcp > BUDGET.maxLCP * 1.5 ? 'critical' : 'warning',
            });
          }
        }

        if (entry.entryType === 'layout-shift' && !(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
          // CLS tracking is cumulative - handled elsewhere
        }

        violations.forEach((v) => {
          const key = `${v.metric}:${v.severity}`;
          const now = Date.now();
          if (lastWarned[key] && now - lastWarned[key] < 30000) return;
          lastWarned[key] = now;
          if (!import.meta.env.PROD && v.severity !== 'critical') return;
          const icon = v.severity === 'critical' ? '🔴' : '🟡';
          logger.warn(
            `${icon} Performance budget exceeded: ${v.metric} = ${v.value}${v.unit} (budget: ${v.budget}${v.unit})`
          );
        });
      }
    });

    _webVitalsObserver = observer;
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // PerformanceObserver not supported for these types
  }
}

/**
 * Creates a render counter for a component to detect excessive re-renders.
 */
export function createRenderTracker(componentName: string) {
  let renderCount = 0;
  let lastReset = Date.now();

  return {
    track() {
      renderCount++;
      const elapsed = (Date.now() - lastReset) / 1000;

      if (elapsed >= 1) {
        if (renderCount > BUDGET.maxRendersPerSecond) {
          logger.warn(
            `🟡 ${componentName}: ${renderCount} renders/sec (budget: ${BUDGET.maxRendersPerSecond})`
          );
        }
        renderCount = 0;
        lastReset = Date.now();
      }
    },
  };
}

/**
 * Run all performance budget checks.
 */
export function auditPerformanceBudget(): BudgetViolation[] {
  const violations: BudgetViolation[] = [];

  const domViolation = checkDOMBudget();
  if (domViolation) violations.push(domViolation);

  if (violations.length > 0) {
    logger.warn(`⚠️ ${violations.length} performance budget violation(s) detected`);
    violations.forEach((v) => {
      logger.warn(`  - ${v.metric}: ${v.value}${v.unit} (budget: ${v.budget}${v.unit})`);
    });
  }

  return violations;
}

/**
 * Initialize performance monitoring (dev only).
 */
export function initPerformanceMonitoring(): void {
  if (!import.meta.env.DEV) return;

  checkWebVitals();

  // Check DOM budget periodically
  if (_auditInterval) { clearInterval(_auditInterval); _auditInterval = null; }
  _auditInterval = setInterval(() => {
    auditPerformanceBudget();
  }, 30000);

  logger.info('📊 Performance budget monitoring initialized');
}
