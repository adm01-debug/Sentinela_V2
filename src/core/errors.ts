/**
 * @fileoverview Core error classes for Sentinela framework
 * @module @sentinela/core/errors
 */

/**
 * Base error class for all Sentinela errors
 */
export class SentinelaError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string = 'SENTINELA_ERROR', context?: Record<string, unknown>) {
    super(message);
    this.name = 'SentinelaError';
    this.code = code;
    this.timestamp = new Date();
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack
    };
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends SentinelaError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends SentinelaError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', { ...context, field, value });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends SentinelaError {
  public readonly resource: string;
  public readonly id?: string;

  constructor(resource: string, id?: string, context?: Record<string, unknown>) {
    super(`${resource}${id ? ` with id '${id}'` : ''} not found`, 'NOT_FOUND', { ...context, resource, id });
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
  }
}

/**
 * Connection error
 */
export class ConnectionError extends SentinelaError {
  public readonly service: string;

  constructor(service: string, message?: string, context?: Record<string, unknown>) {
    super(message || `Failed to connect to ${service}`, 'CONNECTION_ERROR', { ...context, service });
    this.name = 'ConnectionError';
    this.service = service;
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends SentinelaError {
  public readonly operation: string;
  public readonly timeoutMs: number;

  constructor(operation: string, timeoutMs: number, context?: Record<string, unknown>) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, 'TIMEOUT_ERROR', { ...context, operation, timeoutMs });
    this.name = 'TimeoutError';
    this.operation = operation;
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends SentinelaError {
  public readonly retryAfter?: number;

  constructor(message?: string, retryAfter?: number, context?: Record<string, unknown>) {
    super(message || 'Rate limit exceeded', 'RATE_LIMIT_ERROR', { ...context, retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Circuit breaker open error
 */
export class CircuitBreakerOpenError extends SentinelaError {
  public readonly circuit: string;

  constructor(circuit: string, context?: Record<string, unknown>) {
    super(`Circuit breaker '${circuit}' is open`, 'CIRCUIT_OPEN', { ...context, circuit });
    this.name = 'CircuitBreakerOpenError';
    this.circuit = circuit;
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends SentinelaError {
  public readonly requiredPermission?: string;

  constructor(message?: string, requiredPermission?: string, context?: Record<string, unknown>) {
    super(message || 'Access denied', 'AUTHORIZATION_ERROR', { ...context, requiredPermission });
    this.name = 'AuthorizationError';
    this.requiredPermission = requiredPermission;
  }
}

/**
 * Conflict error
 */
export class ConflictError extends SentinelaError {
  public readonly resource: string;

  constructor(resource: string, message?: string, context?: Record<string, unknown>) {
    super(message || `Conflict on resource '${resource}'`, 'CONFLICT_ERROR', { ...context, resource });
    this.name = 'ConflictError';
    this.resource = resource;
  }
}

/**
 * Retry exhausted error
 */
export class RetryExhaustedError extends SentinelaError {
  public readonly attempts: number;
  public readonly lastError?: Error;

  constructor(attempts: number, lastError?: Error, context?: Record<string, unknown>) {
    super(`All ${attempts} retry attempts exhausted`, 'RETRY_EXHAUSTED', context);
    this.name = 'RetryExhaustedError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}
