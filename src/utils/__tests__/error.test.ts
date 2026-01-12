import { describe, it, expect, vi } from 'vitest';

describe('error utils', () => {
  describe('error types', () => {
    it('should create standard Error', () => {
      const error = new Error('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect(error.name).toBe('Error');
    });

    it('should create TypeError', () => {
      const error = new TypeError('Invalid type');
      expect(error.name).toBe('TypeError');
    });

    it('should create RangeError', () => {
      const error = new RangeError('Value out of range');
      expect(error.name).toBe('RangeError');
    });

    it('should create SyntaxError', () => {
      const error = new SyntaxError('Invalid syntax');
      expect(error.name).toBe('SyntaxError');
    });
  });

  describe('custom errors', () => {
    class ApiError extends Error {
      constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'ApiError';
      }
    }

    class ValidationError extends Error {
      constructor(public field: string, message: string) {
        super(message);
        this.name = 'ValidationError';
      }
    }

    it('should create ApiError with status code', () => {
      const error = new ApiError(404, 'Not Found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not Found');
      expect(error.name).toBe('ApiError');
    });

    it('should create ValidationError with field', () => {
      const error = new ValidationError('email', 'Invalid email format');
      expect(error.field).toBe('email');
      expect(error.message).toBe('Invalid email format');
    });

    it('should be instanceof Error', () => {
      const error = new ApiError(500, 'Server Error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('error handling', () => {
    it('should catch and rethrow errors', () => {
      const throwError = () => {
        throw new Error('Original error');
      };

      expect(throwError).toThrow('Original error');
    });

    it('should handle async errors', async () => {
      const asyncError = async () => {
        throw new Error('Async error');
      };

      await expect(asyncError()).rejects.toThrow('Async error');
    });

    it('should handle promise rejection', async () => {
      const rejected = Promise.reject(new Error('Rejected'));
      await expect(rejected).rejects.toThrow('Rejected');
    });
  });

  describe('error stack trace', () => {
    it('should have stack trace', () => {
      const error = new Error('Test');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Error: Test');
    });

    it('should capture stack trace', () => {
      function level1() {
        return level2();
      }
      function level2() {
        return new Error('Deep error');
      }
      const error = level1();
      expect(error.stack).toContain('level2');
    });
  });

  describe('error formatting', () => {
    it('should format error message', () => {
      const formatError = (error: Error) => ({
        name: error.name,
        message: error.message,
        timestamp: new Date().toISOString(),
      });

      const error = new Error('Test error');
      const formatted = formatError(error);
      expect(formatted.name).toBe('Error');
      expect(formatted.message).toBe('Test error');
      expect(formatted.timestamp).toBeDefined();
    });

    it('should serialize error to JSON', () => {
      const error = new Error('Serializable error');
      const json = JSON.stringify({
        name: error.name,
        message: error.message,
      });
      const parsed = JSON.parse(json);
      expect(parsed.message).toBe('Serializable error');
    });
  });

  describe('error recovery', () => {
    it('should provide fallback value on error', () => {
      const safeParseJSON = (str: string, fallback: any = null) => {
        try {
          return JSON.parse(str);
        } catch {
          return fallback;
        }
      };

      expect(safeParseJSON('{"valid": true}')).toEqual({ valid: true });
      expect(safeParseJSON('invalid', {})).toEqual({});
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      const retry = async (fn: () => Promise<any>, maxAttempts: number) => {
        while (attempts < maxAttempts) {
          try {
            attempts++;
            return await fn();
          } catch (e) {
            if (attempts >= maxAttempts) throw e;
          }
        }
      };

      const failTwice = async () => {
        if (attempts < 2) throw new Error('Temporary failure');
        return 'success';
      };

      const result = await retry(failTwice, 3);
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });
  });
});
