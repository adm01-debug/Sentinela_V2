import { retry, withRetry, RetryExhaustedError } from '../../core/retry';

describe('retry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retry(fn, { maxAttempts: 3 });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const promise = retry(fn, { maxAttempts: 3, initialDelayMs: 100 });
    jest.runAllTimers();
    const result = await promise;
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after max attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fail'));
    
    const promise = retry(fn, { maxAttempts: 3, initialDelayMs: 100 });
    jest.runAllTimers();
    
    await expect(promise).rejects.toThrow(RetryExhaustedError);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should respect retryableErrors filter', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('not retryable'));
    
    const promise = retry(fn, {
      maxAttempts: 3,
      retryableErrors: (e) => e.message !== 'not retryable'
    });
    
    await expect(promise).rejects.toThrow(RetryExhaustedError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('withRetry', () => {
  it('should create retryable function', async () => {
    const fn = jest.fn().mockResolvedValue('result');
    const retryable = withRetry(fn, { maxAttempts: 2 });
    
    const result = await retryable();
    expect(result).toBe('result');
  });
});
