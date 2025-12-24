export class ProtocolAdapter {
  private converters: Map<string, (data: unknown) => unknown> = new Map();
  
  registerConverter(from: string, to: string, converter: (data: unknown) => unknown): void {
    this.converters.set(from + '->' + to, converter);
  }
  
  convert(data: unknown, from: string, to: string): unknown {
    const converter = this.converters.get(from + '->' + to);
    if (!converter) throw new Error('No converter for ' + from + ' -> ' + to);
    return converter(data);
  }
}

export class LoggingAdapter {
  private logs: LogEntry[] = [];
  
  log(level: string, message: string, context?: Record<string, unknown>): void {
    this.logs.push({ timestamp: new Date(), level, message, context });
    console.log('[' + level.toUpperCase() + ']', message, context ?? '');
  }
  
  getLogs(level?: string): LogEntry[] {
    return level ? this.logs.filter(l => l.level === level) : this.logs;
  }
}

interface LogEntry { timestamp: Date; level: string; message: string; context?: Record<string, unknown>; }