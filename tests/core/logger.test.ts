/**
 * @jest-environment node
 */
import { SentinelaLogger, createLogger, LogLevel } from '../../src/core/logger';

describe('SentinelaLogger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages', () => {
    const logger = new SentinelaLogger({ level: 'info', format: 'json' });
    logger.info('Test message', { key: 'value' });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should respect log level', () => {
    const logger = new SentinelaLogger({ level: 'error' });
    logger.debug('Debug message');
    logger.info('Info message');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should create child logger with context', () => {
    const parent = new SentinelaLogger({ level: 'info' });
    const child = parent.child({ service: 'test' });
    expect(child).toBeInstanceOf(SentinelaLogger);
  });

  it('should format as JSON', () => {
    const logger = new SentinelaLogger({ level: 'info', format: 'json' });
    logger.info('Test');
    const call = consoleSpy.mock.calls[0][0];
    expect(() => JSON.parse(call)).not.toThrow();
  });

  it('should format as text', () => {
    const logger = new SentinelaLogger({ level: 'info', format: 'text' });
    logger.info('Test');
    const call = consoleSpy.mock.calls[0][0];
    expect(call).toContain('INFO');
    expect(call).toContain('Test');
  });

  it('should include error details', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const logger = new SentinelaLogger({ level: 'error', format: 'json' });
    const error = new Error('Test error');
    logger.error('Error occurred', error);
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe('createLogger', () => {
  it('should create logger with config', () => {
    const logger = createLogger({ level: 'debug' });
    expect(logger).toBeInstanceOf(SentinelaLogger);
  });
});
