// Retry Utilities Tests for Sentinela v17
import { describe, it, expect, vi } from 'vitest';
import { retry, retryable, retryWithFallback, isRetryable, RetryError } from '../retry';

describe('retry utilities', () => {
  describe('retry', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      const result = await retry(fn, { delay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('always fails'));
      await expect(retry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow('always fails');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      await retry(fn, { delay: 10, onRetry });
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should respect retryOn predicate', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('permanent'));
      await expect(
        retry(fn, {
          maxAttempts: 3,
          delay: 10,
          retryOn: (err) => err.message !== 'permanent',
        })
      ).rejects.toThrow('permanent');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryable', () => {
    it('should create retryable function', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      const retryableFn = retryable(fn, { delay: 10 });
      const result = await retryableFn();
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('retryWithFallback', () => {
    it('should use fallback on failure', async () => {
      const primary = vi.fn().mockRejectedValue(new Error('fail'));
      const fallback = vi.fn().mockResolvedValue('fallback');
      const result = await retryWithFallback(primary, fallback, { maxAttempts: 2, delay: 10 });
      expect(result).toBe('fallback');
    });
  });

  describe('isRetryable', () => {
    it('should identify retryable errors', () => {
      const timeoutError = new Error('timeout');
      (timeoutError as any).code = 'ETIMEDOUT';
      expect(isRetryable(timeoutError)).toBe(true);

      const serverError = new Error('server error');
      (serverError as any).status = 503;
      expect(isRetryable(serverError)).toBe(true);

      const normalError = new Error('normal');
      expect(isRetryable(normalError)).toBe(false);
    });
  });
});
