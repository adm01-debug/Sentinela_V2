/**
 * @jest-environment node
 */
import { CircuitBreaker, CircuitBreakerRegistry } from '../../src/core/circuit-breaker';
import { CircuitBreakerOpenError } from '../../src/core/errors';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test', {
      failureThreshold: 2,
      successThreshold: 1,
      resetTimeoutMs: 100
    });
  });

  it('should execute function in closed state', async () => {
    const result = await breaker.execute(() => Promise.resolve('success'));
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('closed');
  });

  it('should open after failure threshold', async () => {
    const failingFn = () => Promise.reject(new Error('fail'));
    
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    
    expect(breaker.getState()).toBe('open');
  });

  it('should throw CircuitBreakerOpenError when open', async () => {
    const failingFn = () => Promise.reject(new Error('fail'));
    
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    
    await expect(breaker.execute(() => Promise.resolve('ok')))
      .rejects
      .toThrow(CircuitBreakerOpenError);
  });

  it('should transition to half-open after reset timeout', async () => {
    const failingFn = () => Promise.reject(new Error('fail'));
    
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    
    await new Promise(r => setTimeout(r, 150));
    
    const result = await breaker.execute(() => Promise.resolve('recovered'));
    expect(result).toBe('recovered');
    expect(breaker.getState()).toBe('closed');
  });

  it('should track stats', async () => {
    await breaker.execute(() => Promise.resolve('ok'));
    const stats = breaker.getStats();
    expect(stats.totalCalls).toBe(1);
    expect(stats.state).toBe('closed');
  });

  it('should reset', async () => {
    const failingFn = () => Promise.reject(new Error('fail'));
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    
    breaker.reset();
    expect(breaker.getState()).toBe('closed');
  });
});

describe('CircuitBreakerRegistry', () => {
  it('should return same breaker for same name', () => {
    const registry = new CircuitBreakerRegistry();
    const b1 = registry.get('test');
    const b2 = registry.get('test');
    expect(b1).toBe(b2);
  });

  it('should reset all breakers', () => {
    const registry = new CircuitBreakerRegistry();
    registry.get('a');
    registry.get('b');
    registry.resetAll();
    expect(registry.getAll().size).toBe(2);
  });
});
