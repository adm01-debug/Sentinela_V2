import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('debounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should debounce function calls', () => {
    const fn = vi.fn();
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };
    
    const debouncedFn = debounce(fn, 100);
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to debounced function', () => {
    const fn = vi.fn();
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };
    
    const debouncedFn = debounce(fn, 50);
    debouncedFn('arg1', 'arg2');
    
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});
