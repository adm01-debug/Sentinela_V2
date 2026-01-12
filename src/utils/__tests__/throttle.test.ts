import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('throttle', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should throttle function calls', () => {
    const fn = vi.fn();
    const throttle = (func: Function, limit: number) => {
      let inThrottle = false;
      return (...args: any[]) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    };
    
    const throttledFn = throttle(fn, 100);
    throttledFn();
    throttledFn();
    throttledFn();
    
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments to throttled function', () => {
    const fn = vi.fn();
    const throttle = (func: Function, limit: number) => {
      let inThrottle = false;
      return (...args: any[]) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    };
    
    const throttledFn = throttle(fn, 50);
    throttledFn('test');
    expect(fn).toHaveBeenCalledWith('test');
  });
});
