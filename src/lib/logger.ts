/**
 * Structured Logger — centralized logging with levels, context, and structured output.
 * Replaces ad-hoc console.log calls with a consistent, filterable logging system.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const getMinLevel = (): LogLevel => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) return 'warn';
  return 'debug';
};

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.level.toUpperCase()}]`;
  const ctx = entry.context ? ` (${entry.context})` : '';
  return `${prefix}${ctx} ${entry.message}`;
}

function log(level: LogLevel, message: string, context?: string, ...args: unknown[]) {
  if (LOG_LEVELS[level] < LOG_LEVELS[getMinLevel()]) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  const formatted = formatEntry(entry);
  const logArgs: unknown[] = [formatted, ...args];

  switch (level) {
    case 'debug': console.debug(...logArgs); break;
    case 'info':  console.info(...logArgs); break;
    case 'warn':  console.warn(...logArgs); break;
    case 'error': console.error(...logArgs); break;
  }

  return entry;
}

function logError(message: string, err: unknown, context?: string) {
  const errorObj = err instanceof Error ? err : new Error(String(err));
  const entry: LogEntry = {
    level: 'error',
    message,
    timestamp: new Date().toISOString(),
    context,
    error: { message: errorObj.message, stack: errorObj.stack },
  };

  console.error(formatEntry(entry), { error: errorObj });
  return entry;
}

/** Create a scoped logger for a specific module/component */
function createLogger(context: string) {
  return {
    debug: (msg: string, ...args: unknown[]) => log('debug', msg, context, ...args),
    info:  (msg: string, ...args: unknown[]) => log('info', msg, context, ...args),
    warn:  (msg: string, ...args: unknown[]) => log('warn', msg, context, ...args),
    error: (msg: string, ...args: unknown[]) => {
      if (args.length === 1 && args[0] instanceof Error) return logError(msg, args[0], context);
      return log('error', msg, context, ...args);
    },
  };
}

export const logger = {
  debug: (msg: string, ...args: unknown[]) => log('debug', msg, undefined, ...args),
  info:  (msg: string, ...args: unknown[]) => log('info', msg, undefined, ...args),
  warn:  (msg: string, ...args: unknown[]) => log('warn', msg, undefined, ...args),
  error: (msg: string, ...args: unknown[]) => {
    if (args.length === 1 && args[0] instanceof Error) return logError(msg, args[0]);
    return log('error', msg, undefined, ...args);
  },
  create: createLogger,
};

export type { LogLevel, LogEntry };
export default logger;
