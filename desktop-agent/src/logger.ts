import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private logDir: string;
  private logFile: string;
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.logDir = path.join(app.getPath('userData'), 'logs');
    this.logFile = path.join(this.logDir, 'agent.log');
    this.ensureLogDir();
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private rotateIfNeeded() {
    if (fs.existsSync(this.logFile)) {
      const stats = fs.statSync(this.logFile);
      if (stats.size > this.maxFileSize) {
        const rotated = `${this.logFile}.${Date.now()}.old`;
        fs.renameSync(this.logFile, rotated);
      }
    }
  }

  private write(level: LogLevel, message: string, data?: unknown) {
    this.rotateIfNeeded();
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.logFile, line);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  debug(message: string, data?: unknown) { this.write('debug', message, data); }
  info(message: string, data?: unknown) { this.write('info', message, data); }
  warn(message: string, data?: unknown) { this.write('warn', message, data); }
  error(message: string, data?: unknown) { this.write('error', message, data); }
}

export const logger = new Logger();
