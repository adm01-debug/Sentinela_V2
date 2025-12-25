/**
 * @jest-environment node
 */
import { retry, withRetry, Retryable } from '../../src/core/retry';
import { RetryExhaustedError } from '../../src/core/errors';

describe('retry', () => {
  it('should return result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retry(fn, { maxAttempts: 3 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const result = await retry(fn, { maxAttempts: 3, initialDelayMs: 1 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw RetryExhaustedError after max attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));
    
    await expect(retry(fn, { maxAttempts: 3, initialDelayMs: 1 }))
      .rejects
      .toThrow(RetryExhaustedError);
    
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should respect retryOn predicate', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('not retryable'));
    
    await expect(retry(fn, {
      maxAttempts: 3,
      retryOn: () => false
    })).rejects.toThrow('not retryable');
    
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('withRetry', () => {
  it('should create retryable function', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const retryable = withRetry(fn);
    const result = await retryable();
    expect(result).toBe('ok');
  });
});
