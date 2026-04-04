// ============================================================
// CIRCUIT BREAKER TESTS
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker } from '@/lib/circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 100,
      halfOpenMaxCalls: 1,
    });
  });

  it('starts in CLOSED state', () => {
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('stays CLOSED on successful calls', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    await breaker.call(fn);
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('opens after reaching failure threshold', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.call(fn); } catch { /* expected */ }
    }
    expect(breaker.getState()).toBe('OPEN');
  });

  it('rejects calls when OPEN', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.call(fn); } catch { /* expected */ }
    }
    
    await expect(breaker.call(vi.fn())).rejects.toThrow('Circuit breaker is OPEN');
  });

  it('transitions to HALF_OPEN after timeout', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.call(fn); } catch { /* expected */ }
    }
    
    await new Promise(r => setTimeout(r, 150));
    expect(breaker.getState()).toBe('HALF_OPEN');
  });

  it('closes again after successful call in HALF_OPEN', async () => {
    const failFn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.call(failFn); } catch { /* expected */ }
    }
    
    await new Promise(r => setTimeout(r, 150));
    
    const successFn = vi.fn().mockResolvedValue('ok');
    await breaker.call(successFn);
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('returns to OPEN on failure in HALF_OPEN', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.call(fn); } catch { /* expected */ }
    }
    
    await new Promise(r => setTimeout(r, 150));
    
    try { await breaker.call(fn); } catch { /* expected */ }
    expect(breaker.getState()).toBe('OPEN');
  });
});
