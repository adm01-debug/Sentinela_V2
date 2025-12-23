type LogLevel = 'debug' | 'info' | 'warn' | 'error';
class AppLogger {
  private level: LogLevel = 'info';
  private levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
  setLevel(level: LogLevel) { this.level = level; }
  private log(level: LogLevel, message: string, data?: any) { if (this.levels[level] >= this.levels[this.level]) console[level]('[' + new Date().toISOString() + ']', '[' + level.toUpperCase() + ']', message, data || ''); }
  debug(message: string, data?: any) { this.log('debug', message, data); }
  info(message: string, data?: any) { this.log('info', message, data); }
  warn(message: string, data?: any) { this.log('warn', message, data); }
  error(message: string, data?: any) { this.log('error', message, data); }
}
export const appLogger = new AppLogger();
