/**
 * SENTINELA - Violations & Security Test Suite
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViolations } from '@/hooks/useViolations';

describe('Violations System', () => {
  describe('useViolations Hook', () => {
    it('should start with empty violations', () => {
      const { result } = renderHook(() => useViolations());
      expect(result.current.violations).toHaveLength(0);
      expect(result.current.unresolved).toHaveLength(0);
      expect(result.current.critical).toHaveLength(0);
    });

    it('should add a violation', () => {
      const { result } = renderHook(() => useViolations());
      act(() => { result.current.add('usb_access', 'high'); });
      expect(result.current.violations).toHaveLength(1);
      expect(result.current.violations[0].type).toBe('usb_access');
      expect(result.current.violations[0].severity).toBe('high');
      expect(result.current.violations[0].resolved).toBe(false);
    });

    it('should add multiple violations', () => {
      const { result } = renderHook(() => useViolations());
      act(() => {
        result.current.add('print_screen', 'critical');
        result.current.add('usb_access', 'high');
        result.current.add('external_storage', 'medium');
      });
      expect(result.current.violations).toHaveLength(3);
    });

    it('should track unresolved violations', () => {
      const { result } = renderHook(() => useViolations());
      let violationId: string;
      act(() => { violationId = result.current.add('print_screen', 'critical').id; });
      act(() => { result.current.add('usb_access', 'high'); });
      expect(result.current.unresolved).toHaveLength(2);
      act(() => { result.current.resolve(violationId); });
      expect(result.current.unresolved).toHaveLength(1);
    });

    it('should track critical violations', () => {
      const { result } = renderHook(() => useViolations());
      act(() => {
        result.current.add('print_screen', 'critical');
        result.current.add('usb_access', 'high');
        result.current.add('external_storage', 'critical');
      });
      expect(result.current.critical).toHaveLength(2);
    });

    it('should resolve violations correctly', () => {
      const { result } = renderHook(() => useViolations());
      let id: string;
      act(() => { id = result.current.add('test', 'low').id; });
      act(() => { result.current.resolve(id); });
      expect(result.current.violations[0].resolved).toBe(true);
    });

    it('should not affect other violations when resolving one', () => {
      const { result } = renderHook(() => useViolations());
      let id1: string, id2: string;
      act(() => {
        id1 = result.current.add('type1', 'high').id;
        id2 = result.current.add('type2', 'low').id;
      });
      act(() => { result.current.resolve(id1); });
      const v2 = result.current.violations.find(v => v.id === id2);
      expect(v2?.resolved).toBe(false);
    });

    it('should handle severity levels correctly', () => {
      const { result } = renderHook(() => useViolations());
      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
      act(() => { severities.forEach(s => result.current.add('test', s)); });
      expect(result.current.violations.map(v => v.severity)).toEqual(severities);
    });

    it('should generate unique IDs for each violation', () => {
      const { result } = renderHook(() => useViolations());
      act(() => {
        result.current.add('type1', 'low');
        result.current.add('type2', 'low');
        result.current.add('type3', 'low');
      });
      const ids = result.current.violations.map(v => v.id);
      expect(new Set(ids).size).toBe(3);
    });
  });
});

describe('Security Scenarios', () => {
  describe('Print Screen Blocking', () => {
    it('should create violation for print screen attempt', () => {
      const { result } = renderHook(() => useViolations());
      act(() => { result.current.add('print_screen_blocked', 'critical'); });
      expect(result.current.critical).toHaveLength(1);
      expect(result.current.critical[0].type).toBe('print_screen_blocked');
    });
  });

  describe('USB Access Blocking', () => {
    it('should create violation for USB access attempt', () => {
      const { result } = renderHook(() => useViolations());
      act(() => { result.current.add('usb_access_blocked', 'high'); });
      expect(result.current.unresolved).toHaveLength(1);
    });
  });

  describe('External Storage Blocking', () => {
    it('should create violation for external storage attempt', () => {
      const { result } = renderHook(() => useViolations());
      act(() => { result.current.add('external_storage_blocked', 'high'); });
      expect(result.current.unresolved).toHaveLength(1);
    });
  });

  describe('Multiple Security Events', () => {
    it('should handle burst of security events', () => {
      const { result } = renderHook(() => useViolations());
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.add(`event_${i}`, i % 4 === 0 ? 'critical' : 'high');
        }
      });
      expect(result.current.violations).toHaveLength(100);
      expect(result.current.critical).toHaveLength(25);
    });
  });
});
