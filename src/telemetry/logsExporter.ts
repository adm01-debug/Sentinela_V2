type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogEntry = { level: LogLevel; message: string; context?: any; timestamp: Date };
class LogsExporter {
  private logs: LogEntry[] = [];
  private minLevel: LogLevel = 'info';
  private levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
  setMinLevel(level: LogLevel) { this.minLevel = level; }
  log(level: LogLevel, message: string, context?: any) { if (this.levels[level] >= this.levels[this.minLevel]) this.logs.push({ level, message, context, timestamp: new Date() }); }
  debug(message: string, context?: any) { this.log('debug', message, context); }
  info(message: string, context?: any) { this.log('info', message, context); }
  warn(message: string, context?: any) { this.log('warn', message, context); }
  error(message: string, context?: any) { this.log('error', message, context); }
  flush(): LogEntry[] { const l = this.logs; this.logs = []; return l; }
}
export const logsExporter = new LogsExporter();
