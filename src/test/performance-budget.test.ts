import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditPerformanceBudget, createRenderTracker } from '@/lib/performanceBudget';

describe('performanceBudget', () => {
  describe('auditPerformanceBudget', () => {
    it('returns empty array when DOM is within budget', () => {
      const violations = auditPerformanceBudget();
      // In test env, DOM is minimal
      expect(Array.isArray(violations)).toBe(true);
      expect(violations.length).toBe(0);
    });
  });

  describe('createRenderTracker', () => {
    it('creates a tracker with track method', () => {
      const tracker = createRenderTracker('TestComponent');
      expect(typeof tracker.track).toBe('function');
    });

    it('does not throw when tracking renders', () => {
      const tracker = createRenderTracker('TestComponent');
      expect(() => {
        for (let i = 0; i < 100; i++) tracker.track();
      }).not.toThrow();
    });
  });
});
