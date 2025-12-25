import { withTimeout, delay, debounce, throttle } from '../../core/timeout';
import { TimeoutError } from '../../core/errors';

describe('withTimeout', () => {
  it('should resolve before timeout', async () => {
    const result = await withTimeout(
      async () => 'success',
      1000
    );
    
    expect(result).toBe('success');
  });

  it('should throw on timeout', async () => {
    await expect(
      withTimeout(
        () => new Promise(r => setTimeout(r, 1000)),
        50,
        'slow-op'
      )
    ).rejects.toThrow(TimeoutError);
  });
});

describe('delay', () => {
  it('should delay execution', async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeGreaterThanOrEqual(45);
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  it('should debounce function calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    debounced();
    debounced();
    
    expect(fn).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  it('should throttle function calls', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const throttled = throttle(fn, 100);
    
    throttled();
    throttled();
    throttled();
    
    expect(fn).toHaveBeenCalledTimes(1);
    
    jest.advanceTimersByTime(100);
    throttled();
    
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
