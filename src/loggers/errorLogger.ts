interface ErrorLogEntry { timestamp: string; message: string; stack?: string; context?: any; userId?: string; }
class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  log(error: Error, context?: any, userId?: string) { const entry: ErrorLogEntry = { timestamp: new Date().toISOString(), message: error.message, stack: error.stack, context, userId }; this.logs.push(entry); console.error('[ErrorLogger]', entry); if (this.logs.length > 100) this.logs.shift(); }
  getLogs(): ErrorLogEntry[] { return [...this.logs]; }
  clear() { this.logs = []; }
  getRecent(count = 10): ErrorLogEntry[] { return this.logs.slice(-count); }
}
export const errorLogger = new ErrorLogger();
