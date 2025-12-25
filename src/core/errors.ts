/**
 * @packageDocumentation
 * @module Core/Errors
 * Hierarchical error classes for Sentinela framework
 */

/**
 * Base error class for all Sentinela errors
 * @class SentinelaError
 * @extends Error
 */
export class SentinelaError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string = 'SENTINELA_ERROR', context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
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

/** Validation error for invalid input data */
export class ValidationError extends SentinelaError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.field = field;
    this.value = value;
  }
}

/** Configuration error for invalid or missing config */
export class ConfigurationError extends SentinelaError {
  constructor(message: string, configKey?: string) {
    super(message, 'CONFIGURATION_ERROR', { configKey });
  }
}

/** Connection error for database/network issues */
export class ConnectionError extends SentinelaError {
  public readonly host?: string;
  public readonly port?: number;

  constructor(message: string, host?: string, port?: number) {
    super(message, 'CONNECTION_ERROR', { host, port });
    this.host = host;
    this.port = port;
  }
}

/** Timeout error for operations that exceed time limit */
export class TimeoutError extends SentinelaError {
  public readonly timeoutMs: number;
  public readonly operation?: string;

  constructor(message: string, timeoutMs: number, operation?: string) {
    super(message, 'TIMEOUT_ERROR', { timeoutMs, operation });
    this.timeoutMs = timeoutMs;
    this.operation = operation;
  }
}

/** Not found error for missing resources */
export class NotFoundError extends SentinelaError {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(resourceType + ' not found: ' + resourceId, 'NOT_FOUND_ERROR', { resourceType, resourceId });
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/** Conflict error for duplicate or conflicting operations */
export class ConflictError extends SentinelaError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT_ERROR', context);
  }
}

/** Authorization error for permission issues */
export class AuthorizationError extends SentinelaError {
  public readonly requiredPermission?: string;

  constructor(message: string, requiredPermission?: string) {
    super(message, 'AUTHORIZATION_ERROR', { requiredPermission });
    this.requiredPermission = requiredPermission;
  }
}

/** Rate limit error when quota is exceeded */
export class RateLimitError extends SentinelaError {
  public readonly retryAfterMs: number;

  constructor(message: string, retryAfterMs: number) {
    super(message, 'RATE_LIMIT_ERROR', { retryAfterMs });
    this.retryAfterMs = retryAfterMs;
  }
}

/** Circuit breaker open error */
export class CircuitBreakerOpenError extends SentinelaError {
  public readonly circuitName: string;
  public readonly resetTimeMs: number;

  constructor(circuitName: string, resetTimeMs: number) {
    super('Circuit breaker is open: ' + circuitName, 'CIRCUIT_BREAKER_OPEN', { circuitName, resetTimeMs });
    this.circuitName = circuitName;
    this.resetTimeMs = resetTimeMs;
  }
}

/** Retry exhausted error */
export class RetryExhaustedError extends SentinelaError {
  public readonly attempts: number;
  public readonly lastError?: Error;

  constructor(message: string, attempts: number, lastError?: Error) {
    super(message, 'RETRY_EXHAUSTED', { attempts, lastErrorMessage: lastError?.message });
    this.attempts = attempts;
    this.lastError = lastError;
  }
}
