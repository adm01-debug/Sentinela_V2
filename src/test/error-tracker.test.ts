// ============================================================
// ERROR TRACKER TESTS
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase before importing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
  isSupabaseReady: false,
}));

import { captureError } from '@/lib/errorTracker';

describe('captureError', () => {
  it('captures error without throwing', () => {
    expect(() => {
      captureError(new Error('test error'), { component: 'TestComponent' });
    }).not.toThrow();
  });

  it('accepts severity levels', () => {
    expect(() => {
      captureError(new Error('critical'), { severity: 'critical' });
      captureError(new Error('high'), { severity: 'high' });
      captureError(new Error('medium'), { severity: 'medium' });
      captureError(new Error('low'), { severity: 'low' });
    }).not.toThrow();
  });

  it('accepts context metadata', () => {
    expect(() => {
      captureError(new Error('with context'), {
        component: 'Dashboard',
        context: { userId: '123', action: 'load' },
      });
    }).not.toThrow();
  });
});
