// ============================================================
// CIRCUIT BREAKER TESTS
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker } from '@/lib/circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test', {
      failureThreshold: 3,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 1,
    });
  });

  it('starts in closed state', () => {
    expect(breaker.getState()).toBe('closed');
  });

  it('stays closed on successful calls', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    await breaker.execute(fn);
    expect(breaker.getState()).toBe('closed');
  });

  it('opens after reaching failure threshold', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.execute(fn); } catch { /* expected */ }
    }
    expect(breaker.getState()).toBe('open');
  });

  it('rejects calls when open', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.execute(fn); } catch { /* expected */ }
    }
    
    await expect(breaker.execute(vi.fn())).rejects.toThrow('OPEN');
  });

  it('transitions to half-open after timeout', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.execute(fn); } catch { /* expected */ }
    }
    
    await new Promise(r => setTimeout(r, 150));
    // Trigger state check by calling execute with a success fn
    const successFn = vi.fn().mockResolvedValue('ok');
    await breaker.execute(successFn);
    expect(breaker.getState()).toBe('closed');
  });

  it('uses fallback when open', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    for (let i = 0; i < 3; i++) {
      try { await breaker.execute(fn); } catch { /* expected */ }
    }
    
    const result = await breaker.execute(fn, () => 'fallback');
    expect(result).toBe('fallback');
  });
});
