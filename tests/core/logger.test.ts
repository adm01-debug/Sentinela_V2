import { Logger, createLogger } from '../../core/logger';

describe('Logger', () => {
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
    const logger = new Logger({ level: 'info', pretty: false });
    logger.info('Test message', { key: 'value' });
    
    expect(consoleSpy).toHaveBeenCalled();
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.level).toBe('info');
    expect(logged.message).toBe('Test message');
  });

  it('should not log debug when level is info', () => {
    const logger = new Logger({ level: 'info' });
    logger.debug('Debug message');
    
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should redact sensitive fields', () => {
    const logger = new Logger({ level: 'info', pretty: false });
    logger.info('Auth', { password: 'secret123', user: 'john' });
    
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.context.password).toBe('[REDACTED]');
    expect(logged.context.user).toBe('john');
  });

  it('should create child logger with context', () => {
    const parent = new Logger({ level: 'info', pretty: false });
    const child = parent.child({ module: 'test' });
    
    child.info('Child message');
    
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.context.module).toBe('test');
  });
});

describe('createLogger', () => {
  it('should create logger with module context', () => {
    const logger = createLogger('myModule');
    expect(logger).toBeInstanceOf(Logger);
  });
});
