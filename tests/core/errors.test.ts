/**
 * @jest-environment node
 */
import {
  SentinelaError,
  ValidationError,
  ConfigurationError,
  ConnectionError,
  TimeoutError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
  RateLimitError,
  CircuitBreakerOpenError,
  RetryExhaustedError
} from '../../src/core/errors';

describe('SentinelaError', () => {
  it('should create error with message and code', () => {
    const error = new SentinelaError('Test error', 'TEST_CODE');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('SentinelaError');
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
    const error = new ValidationError('Invalid email', 'email', 'not-an-email');
    expect(error.field).toBe('email');
    expect(error.value).toBe('not-an-email');
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});

describe('NotFoundError', () => {
  it('should format message with resource type and id', () => {
    const error = new NotFoundError('User', '123');
    expect(error.message).toBe('User not found: 123');
    expect(error.resourceType).toBe('User');
    expect(error.resourceId).toBe('123');
  });
});

describe('TimeoutError', () => {
  it('should include timeout and operation', () => {
    const error = new TimeoutError('Operation timed out', 5000, 'fetchData');
    expect(error.timeoutMs).toBe(5000);
    expect(error.operation).toBe('fetchData');
  });
});

describe('CircuitBreakerOpenError', () => {
  it('should include circuit name and reset time', () => {
    const error = new CircuitBreakerOpenError('api-service', 30000);
    expect(error.circuitName).toBe('api-service');
    expect(error.resetTimeMs).toBe(30000);
  });
});

describe('RetryExhaustedError', () => {
  it('should include attempts and last error', () => {
    const lastError = new Error('Connection refused');
    const error = new RetryExhaustedError('Failed after retries', 3, lastError);
    expect(error.attempts).toBe(3);
    expect(error.lastError).toBe(lastError);
  });
});
