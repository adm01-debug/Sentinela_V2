export interface LogEntry { timestamp: Date; level: LogLevel; message: string; source: string; metadata: Record<string, unknown>; }
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface LogQuery { level?: LogLevel; source?: string; from?: Date; to?: Date; search?: string; }