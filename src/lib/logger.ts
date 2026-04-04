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
  if (import.meta.env.PROD) return 'warn';
  return 'debug';
};

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.level.toUpperCase()}]`;
  const ctx = entry.context ? ` (${entry.context})` : '';
  return `${prefix}${ctx} ${entry.message}`;
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < LOG_LEVELS[getMinLevel()]) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    data,
  };

  const formatted = formatEntry(entry);
  const args: unknown[] = [formatted];
  if (data && Object.keys(data).length > 0) args.push(data);

  switch (level) {
    case 'debug': console.debug(...args); break;
    case 'info':  console.info(...args); break;
    case 'warn':  console.warn(...args); break;
    case 'error': console.error(...args); break;
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
    debug: (msg: string, data?: Record<string, unknown>) => log('debug', msg, context, data),
    info:  (msg: string, data?: Record<string, unknown>) => log('info', msg, context, data),
    warn:  (msg: string, data?: Record<string, unknown>) => log('warn', msg, context, data),
    error: (msg: string, err?: unknown, data?: Record<string, unknown>) => {
      if (err) return logError(msg, err, context);
      return log('error', msg, context, data);
    },
  };
}

export const logger = {
  debug: (msg: string, data?: Record<string, unknown>) => log('debug', msg, undefined, data),
  info:  (msg: string, data?: Record<string, unknown>) => log('info', msg, undefined, data),
  warn:  (msg: string, data?: Record<string, unknown>) => log('warn', msg, undefined, data),
  error: (msg: string, err?: unknown, data?: Record<string, unknown>) => {
    if (err) return logError(msg, err);
    return log('error', msg, undefined, data);
  },
  create: createLogger,
};

export type { LogLevel, LogEntry };
export default logger;
