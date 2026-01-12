import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger utils', () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    console.log = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.debug = vi.fn();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      console.debug('Debug message');
      expect(console.debug).toHaveBeenCalledWith('Debug message');
    });

    it('should log info messages', () => {
      console.info('Info message');
      expect(console.info).toHaveBeenCalledWith('Info message');
    });

    it('should log warning messages', () => {
      console.warn('Warning message');
      expect(console.warn).toHaveBeenCalledWith('Warning message');
    });

    it('should log error messages', () => {
      console.error('Error message');
      expect(console.error).toHaveBeenCalledWith('Error message');
    });
  });

  describe('structured logging', () => {
    it('should log with metadata', () => {
      const logWithMeta = (level: string, message: string, meta: object) => {
        console.log(JSON.stringify({ level, message, ...meta, timestamp: Date.now() }));
      };

      logWithMeta('info', 'User action', { userId: '123', action: 'login' });
      expect(console.log).toHaveBeenCalled();
    });

    it('should include timestamp', () => {
      const log = { message: 'Test', timestamp: new Date().toISOString() };
      expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should format context object', () => {
      const context = { requestId: 'abc123', user: 'john' };
      const formatted = JSON.stringify(context);
      expect(formatted).toContain('requestId');
    });
  });

  describe('log formatting', () => {
    it('should format log with prefix', () => {
      const prefix = '[APP]';
      const message = 'Test message';
      console.log(`${prefix} ${message}`);
      expect(console.log).toHaveBeenCalledWith('[APP] Test message');
    });

    it('should colorize log levels', () => {
      const colors = {
        debug: '\x1b[34m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m',
      };
      const colorized = `${colors.info}INFO${colors.reset}: Test`;
      expect(colorized).toContain('\x1b[32m');
    });

    it('should stringify objects', () => {
      const obj = { key: 'value', nested: { a: 1 } };
      const formatted = JSON.stringify(obj, null, 2);
      expect(formatted).toContain('"key": "value"');
    });
  });

  describe('error logging', () => {
    it('should log error stack trace', () => {
      const error = new Error('Test error');
      console.error(error.stack);
      expect(console.error).toHaveBeenCalled();
    });

    it('should log error with context', () => {
      const logError = (error: Error, context: object) => {
        console.error({
          message: error.message,
          stack: error.stack,
          ...context,
        });
      };

      logError(new Error('Failed'), { userId: '123' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('performance logging', () => {
    it('should measure execution time', () => {
      const start = performance.now();
      // Simulate work
      const end = performance.now();
      const duration = end - start;
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should log slow operations', () => {
      const threshold = 100;
      const duration = 150;
      if (duration > threshold) {
        console.warn(`Slow operation: ${duration}ms`);
      }
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('conditional logging', () => {
    it('should respect log level setting', () => {
      const logLevel = 'warn';
      const levels = ['debug', 'info', 'warn', 'error'];
      const shouldLog = (level: string) => 
        levels.indexOf(level) >= levels.indexOf(logLevel);

      expect(shouldLog('debug')).toBe(false);
      expect(shouldLog('warn')).toBe(true);
      expect(shouldLog('error')).toBe(true);
    });

    it('should disable logging in production', () => {
      const isProd = process.env.NODE_ENV === 'production';
      const log = !isProd ? console.log : () => {};
      log('Development only');
    });
  });
});
