// Debezium Connector
export interface DebeziumConfig { connector: string; database: string; tables: string[]; }
export class DebeziumConnector {
  private running = false;
  constructor(private config: DebeziumConfig) {}
  async start(): Promise<void> { this.running = true; console.log("[Debezium] Started for", this.config.database); }
  async stop(): Promise<void> { this.running = false; }
  isRunning(): boolean { return this.running; }
  async getStatus(): Promise<Record<string, unknown>> { return { connector: this.config.connector, running: this.running, tables: this.config.tables }; }
}
