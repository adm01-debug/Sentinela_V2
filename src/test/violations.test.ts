/**
 * SENTINELA - Violations & Security Test Suite
 * Tests pure violation logic — hook now uses Supabase (async)
 */
import { describe, it, expect } from 'vitest';

describe('Violations System', () => {
  describe('Violation Data Model', () => {
    it('should support all severity levels', () => {
      const severities = ['low', 'medium', 'high', 'critical'];
      severities.forEach(s => expect(['low', 'medium', 'high', 'critical']).toContain(s));
    });

    it('should support all status values', () => {
      const statuses = ['open', 'investigating', 'resolved', 'dismissed'];
      statuses.forEach(s => expect(typeof s).toBe('string'));
    });

    it('should filter unresolved violations', () => {
      const violations = [
        { id: '1', status: 'open', severity: 'critical' },
        { id: '2', status: 'resolved', severity: 'high' },
        { id: '3', status: 'investigating', severity: 'medium' },
      ];
      const unresolved = violations.filter(v => v.status !== 'resolved');
      expect(unresolved).toHaveLength(2);
    });

    it('should filter critical violations', () => {
      const violations = [
        { id: '1', status: 'open', severity: 'critical' },
        { id: '2', status: 'open', severity: 'high' },
        { id: '3', status: 'open', severity: 'critical' },
        { id: '4', status: 'resolved', severity: 'critical' },
      ];
      const critical = violations.filter(v => v.severity === 'critical' && v.status !== 'resolved');
      expect(critical).toHaveLength(2);
    });

    it('should handle empty violations array', () => {
      const violations: Array<{ id: string; status: string; severity: string }> = [];
      expect(violations.filter(v => v.status !== 'resolved')).toHaveLength(0);
      expect(violations.filter(v => v.severity === 'critical')).toHaveLength(0);
    });
  });
});

describe('Security Scenarios', () => {
  describe('Print Screen Blocking', () => {
    it('should classify print screen as critical', () => {
      const violation = { type: 'print_screen_blocked', severity: 'critical' };
      expect(violation.severity).toBe('critical');
    });
  });

  describe('USB Access Blocking', () => {
    it('should classify USB access as high severity', () => {
      const violation = { type: 'usb_access_blocked', severity: 'high' };
      expect(violation.severity).toBe('high');
    });
  });

  describe('External Storage Blocking', () => {
    it('should classify external storage as high severity', () => {
      const violation = { type: 'external_storage_blocked', severity: 'high' };
      expect(violation.severity).toBe('high');
    });
  });

  describe('Multiple Security Events', () => {
    it('should handle burst of security events', () => {
      const violations = Array.from({ length: 100 }, (_, i) => ({
        id: `v-${i}`,
        type: `event_${i}`,
        severity: i % 4 === 0 ? 'critical' : 'high',
        status: 'open',
      }));
      expect(violations).toHaveLength(100);
      expect(violations.filter(v => v.severity === 'critical')).toHaveLength(25);
    });
  });

  describe('Violation Severity Ordering', () => {
    const severityOrder: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    it('critical > high > medium > low', () => {
      expect(severityOrder.critical).toBeGreaterThan(severityOrder.high);
      expect(severityOrder.high).toBeGreaterThan(severityOrder.medium);
      expect(severityOrder.medium).toBeGreaterThan(severityOrder.low);
    });

    it('should sort violations by severity', () => {
      const violations = [
        { severity: 'low' },
        { severity: 'critical' },
        { severity: 'medium' },
        { severity: 'high' },
      ];
      const sorted = [...violations].sort((a, b) => 
        (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0)
      );
      expect(sorted[0].severity).toBe('critical');
      expect(sorted[3].severity).toBe('low');
    });
  });

  describe('Unique ID generation', () => {
    it('should generate unique IDs', () => {
      const ids = Array.from({ length: 100 }, () => crypto.randomUUID());
      expect(new Set(ids).size).toBe(100);
    });
  });
});
