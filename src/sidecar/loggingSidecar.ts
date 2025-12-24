// Logging Sidecar
import { SidecarContainer, SidecarConfig } from "./sidecarContainer";

export interface LogEntry {
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error";
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class LoggingSidecar extends SidecarContainer {
  private entries: LogEntry[] = [];
  private forwarder?: (entries: LogEntry[]) => Promise<void>;
  private flushInterval?: NodeJS.Timeout;

  constructor(config: SidecarConfig, forwarder?: (entries: LogEntry[]) => Promise<void>) {
    super(config);
    this.forwarder = forwarder;
  }

  async start(): Promise<void> {
    await super.start();
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  async stop(): Promise<void> {
    if (this.flushInterval) clearInterval(this.flushInterval);
    await this.flush();
    await super.stop();
  }

  capture(entry: Omit<LogEntry, "timestamp">): void {
    this.entries.push({ ...entry, timestamp: new Date() });
  }

  private async flush(): Promise<void> {
    if (this.entries.length === 0 || !this.forwarder) return;
    const toForward = [...this.entries];
    this.entries = [];
    try {
      await this.forwarder(toForward);
    } catch (e) {
      this.entries.unshift(...toForward);
    }
  }

  getBufferedCount(): number { return this.entries.length; }
}
