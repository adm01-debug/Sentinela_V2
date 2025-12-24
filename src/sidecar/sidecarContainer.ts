// Sidecar Container Pattern
export interface SidecarConfig {
  name: string;
  image?: string;
  resources: { cpu: string; memory: string };
  ports: { name: string; containerPort: number }[];
  env: Record<string, string>;
}

export interface MainContainerConfig {
  name: string;
  image: string;
  ports: { name: string; containerPort: number }[];
}

export class SidecarContainer {
  private started = false;
  private logs: string[] = [];

  constructor(private config: SidecarConfig) {}

  async start(): Promise<void> {
    this.started = true;
    this.log("Sidecar started");
  }

  async stop(): Promise<void> {
    this.started = false;
    this.log("Sidecar stopped");
  }

  isRunning(): boolean { return this.started; }

  protected log(message: string): void {
    this.logs.push(\`[\${new Date().toISOString()}] \${message}\`);
  }

  getLogs(): string[] { return [...this.logs]; }
  getConfig(): SidecarConfig { return { ...this.config }; }
}
