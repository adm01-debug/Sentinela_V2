import { LogEntry, LogLevel } from './types';

export class LogParser {
  parse(raw: string, source: string): LogEntry | null {
    const jsonMatch = raw.match(/^\{.*\}$/);
    if (jsonMatch) return this.parseJSON(raw, source);
    return this.parseText(raw, source);
  }
  
  private parseJSON(raw: string, source: string): LogEntry | null {
    try {
      const data = JSON.parse(raw);
      return { timestamp: new Date(data.timestamp ?? Date.now()), level: data.level ?? 'info', message: data.message ?? raw, source, metadata: data };
    } catch { return null; }
  }
  
  private parseText(raw: string, source: string): LogEntry {
    const levelMatch = raw.match(/\b(DEBUG|INFO|WARN|ERROR|FATAL)\b/i);
    const level = (levelMatch?.[1]?.toLowerCase() as LogLevel) ?? 'info';
    return { timestamp: new Date(), level, message: raw, source, metadata: {} };
  }
}

export class LogFormatter {
  format(entry: LogEntry, template: string = '[{timestamp}] [{level}] {source}: {message}'): string {
    return template
      .replace('{timestamp}', entry.timestamp.toISOString())
      .replace('{level}', entry.level.toUpperCase())
      .replace('{source}', entry.source)
      .replace('{message}', entry.message);
  }
}