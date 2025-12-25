/**
 * @fileoverview Structured logger for Sentinela framework
 * @module @sentinela/core/logger
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
  correlationId?: string;
  requestId?: string;
  userId?: string;
  service?: string;
  module?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  pretty: boolean;
  includeTimestamp: boolean;
  includeLevel: boolean;
  redactKeys: string[];
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

/**
 * Structured logger implementation
 */
export class Logger {
  private config: LoggerConfig;
  private defaultContext: LogContext;

  constructor(config?: Partial<LoggerConfig>, defaultContext?: LogContext) {
    this.config = {
      level: 'info',
      pretty: process.env.NODE_ENV !== 'production',
      includeTimestamp: true,
      includeLevel: true,
      redactKeys: ['password', 'token', 'secret', 'apiKey', 'authorization'],
      ...config
    };
    this.defaultContext = defaultContext || {};
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private redact(obj: Record<string, unknown>): Record<string, unknown> {
    const redacted = { ...obj };
    for (const key of Object.keys(redacted)) {
      if (this.config.redactKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redact(redacted[key] as Record<string, unknown>);
      }
    }
    return redacted;
  }

  private formatEntry(entry: LogEntry): string {
    const redacted = entry.context ? this.redact(entry.context as Record<string, unknown>) : undefined;
    const output = { ...entry, context: redacted };
    
    if (this.config.pretty) {
      return JSON.stringify(output, null, 2);
    }
    return JSON.stringify(output);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.defaultContext, ...context }
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    const formatted = this.formatEntry(entry);
    
    switch (level) {
      case 'error':
      case 'fatal':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log('fatal', message, context, error);
  }

  child(context: LogContext): Logger {
    return new Logger(this.config, { ...this.defaultContext, ...context });
  }
}

/** Default logger instance */
export const logger = new Logger();

/** Create a child logger for a specific module */
export function createLogger(module: string, context?: LogContext): Logger {
  return logger.child({ module, ...context });
}
