import { 
  SentinelaError, 
  ValidationError, 
  NotFoundError, 
  TimeoutError,
  RateLimitError,
  CircuitBreakerOpenError,
  ConnectionError,
  RetryExhaustedError
} from '../../core/errors';

describe('SentinelaError', () => {
  it('should create error with message and code', () => {
    const error = new SentinelaError('Test error', 'TEST_CODE');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should include context', () => {
    const error = new SentinelaError('Test', 'CODE', { key: 'value' });
    expect(error.context).toEqual({ key: 'value' });
  });

  it('should serialize to JSON', () => {
    const error = new SentinelaError('Test', 'CODE');
    const json = error.toJSON();
    expect(json.name).toBe('SentinelaError');
    expect(json.message).toBe('Test');
    expect(json.code).toBe('CODE');
  });
});

describe('ValidationError', () => {
  it('should include field and value', () => {
    const error = new ValidationError('Invalid email', 'email', 'invalid');
    expect(error.field).toBe('email');
    expect(error.value).toBe('invalid');
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});

describe('NotFoundError', () => {
  it('should format message correctly', () => {
    const error = new NotFoundError('User', '123');
    expect(error.message).toBe("User with id '123' not found");
    expect(error.resource).toBe('User');
    expect(error.id).toBe('123');
  });
});

describe('TimeoutError', () => {
  it('should include operation and timeout', () => {
    const error = new TimeoutError('fetchUser', 5000);
    expect(error.operation).toBe('fetchUser');
    expect(error.timeoutMs).toBe(5000);
  });
});

describe('RateLimitError', () => {
  it('should include retry after', () => {
    const error = new RateLimitError('Too many requests', 60);
    expect(error.retryAfter).toBe(60);
  });
});

describe('CircuitBreakerOpenError', () => {
  it('should include circuit name', () => {
    const error = new CircuitBreakerOpenError('api-circuit');
    expect(error.circuit).toBe('api-circuit');
  });
});

describe('RetryExhaustedError', () => {
  it('should include attempts and last error', () => {
    const lastError = new Error('Connection failed');
    const error = new RetryExhaustedError(3, lastError);
    expect(error.attempts).toBe(3);
    expect(error.lastError).toBe(lastError);
  });
});
