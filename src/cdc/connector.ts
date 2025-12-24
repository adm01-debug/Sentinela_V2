import { CDCConfig, SourceConfig, ChangeEvent } from './types';

export abstract class CDCConnector {
  protected running: boolean = false;
  protected handlers: Array<(event: ChangeEvent) => Promise<void>> = [];
  
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  
  onEvent(handler: (event: ChangeEvent) => Promise<void>): void { this.handlers.push(handler); }
  
  protected async emit(event: ChangeEvent): Promise<void> {
    await Promise.all(this.handlers.map(h => h(event)));
  }
}

export class PostgresCDCConnector extends CDCConnector {
  constructor(private config: SourceConfig) { super(); }
  
  async connect(): Promise<void> { console.log('Connected to PostgreSQL'); }
  async disconnect(): Promise<void> { console.log('Disconnected from PostgreSQL'); }
  async start(): Promise<void> { this.running = true; console.log('Started CDC for PostgreSQL'); }
  async stop(): Promise<void> { this.running = false; }
}

export class MySQLCDCConnector extends CDCConnector {
  constructor(private config: SourceConfig) { super(); }
  
  async connect(): Promise<void> { console.log('Connected to MySQL'); }
  async disconnect(): Promise<void> { console.log('Disconnected from MySQL'); }
  async start(): Promise<void> { this.running = true; console.log('Started CDC for MySQL'); }
  async stop(): Promise<void> { this.running = false; }
}