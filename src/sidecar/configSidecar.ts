// Config Sidecar - Configuration Management
import { SidecarContainer, SidecarConfig } from "./sidecarContainer";

export interface ConfigSource {
  type: "file" | "env" | "remote";
  path?: string;
  url?: string;
  refreshInterval?: number;
}

export class ConfigSidecar extends SidecarContainer {
  private config: Record<string, unknown> = {};
  private watchers: Set<(config: Record<string, unknown>) => void> = new Set();
  private refreshTimer?: NodeJS.Timeout;

  constructor(sidecarConfig: SidecarConfig, private sources: ConfigSource[]) {
    super(sidecarConfig);
  }

  async start(): Promise<void> {
    await super.start();
    await this.loadConfig();
    const refreshInterval = this.sources.find(s => s.refreshInterval)?.refreshInterval;
    if (refreshInterval) {
      this.refreshTimer = setInterval(() => this.loadConfig(), refreshInterval);
    }
  }

  async stop(): Promise<void> {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    await super.stop();
  }

  private async loadConfig(): Promise<void> {
    const newConfig: Record<string, unknown> = {};
    for (const source of this.sources) {
      if (source.type === "env") {
        Object.assign(newConfig, process.env);
      }
      // Other sources would load from file/remote
    }
    this.config = newConfig;
    this.notifyWatchers();
  }

  get<T>(key: string, defaultValue?: T): T {
    return (this.config[key] as T) ?? (defaultValue as T);
  }

  watch(callback: (config: Record<string, unknown>) => void): () => void {
    this.watchers.add(callback);
    return () => this.watchers.delete(callback);
  }

  private notifyWatchers(): void {
    for (const watcher of this.watchers) watcher({ ...this.config });
  }
}
