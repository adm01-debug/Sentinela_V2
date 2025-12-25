/**
 * @packageDocumentation
 * @module Core/Logger
 * Structured logging for Sentinela framework
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
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

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  fatal(message: string, error?: Error, context?: LogContext): void;
  child(context: LogContext): Logger;
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  output: 'console' | 'file' | 'stream';
  filePath?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

/**
 * Default structured logger implementation
 */
export class SentinelaLogger implements Logger {
  private readonly config: LoggerConfig;
  private readonly baseContext: LogContext;

  constructor(config: Partial<LoggerConfig> = {}, baseContext: LogContext = {}) {
    this.config = {
      level: config.level ?? 'info',
      format: config.format ?? 'json',
      output: config.output ?? 'console',
      filePath: config.filePath
    };
    this.baseContext = baseContext;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry);
    }
    const ctx = entry.context ? ' ' + JSON.stringify(entry.context) : '';
    const err = entry.error ? ' [' + entry.error.name + ': ' + entry.error.message + ']' : '';
    return '[' + entry.timestamp + '] ' + entry.level.toUpperCase() + ': ' + entry.message + ctx + err;
  }

  private log(level: LogLevel, message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.baseContext, ...context }
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    const formatted = this.formatEntry(entry);
    
    if (this.config.output === 'console') {
      if (level === 'error' || level === 'fatal') {
        console.error(formatted);
      } else if (level === 'warn') {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, undefined, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, error, context);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log('fatal', message, error, context);
  }

  child(context: LogContext): Logger {
    return new SentinelaLogger(this.config, { ...this.baseContext, ...context });
  }
}

/** Global logger instance */
export const logger = new SentinelaLogger();

/** Create a logger with custom config */
export function createLogger(config?: Partial<LoggerConfig>, context?: LogContext): Logger {
  return new SentinelaLogger(config, context);
}
