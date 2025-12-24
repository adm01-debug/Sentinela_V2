import { DatabaseConfig, ConnectionState } from './types';

export class MultiDatabaseManager {
  private configs: Map<string, DatabaseConfig> = new Map();
  private connections: Map<string, DatabaseConnection> = new Map();
  private defaultDb?: string;
  
  addDatabase(config: DatabaseConfig): void {
    this.configs.set(config.name, config);
    if (!this.defaultDb) this.defaultDb = config.name;
  }
  
  setDefault(name: string): void { this.defaultDb = name; }
  
  async connect(name: string): Promise<DatabaseConnection> {
    if (this.connections.has(name)) return this.connections.get(name)!;
    const config = this.configs.get(name);
    if (!config) throw new Error('Database not configured: ' + name);
    const conn = new DatabaseConnection(config);
    await conn.connect();
    this.connections.set(name, conn);
    return conn;
  }
  
  async connectAll(): Promise<void> {
    for (const name of this.configs.keys()) await this.connect(name);
  }
  
  async disconnect(name: string): Promise<void> {
    const conn = this.connections.get(name);
    if (conn) { await conn.disconnect(); this.connections.delete(name); }
  }
  
  async disconnectAll(): Promise<void> {
    for (const name of this.connections.keys()) await this.disconnect(name);
  }
  
  getConnection(name?: string): DatabaseConnection {
    const dbName = name ?? this.defaultDb;
    if (!dbName) throw new Error('No database specified');
    const conn = this.connections.get(dbName);
    if (!conn) throw new Error('Not connected to: ' + dbName);
    return conn;
  }
  
  getStatus(): ConnectionState[] {
    return Array.from(this.connections.entries()).map(([name, conn]) => conn.getState());
  }
}

export class DatabaseConnection {
  private connected: boolean = false;
  private state: ConnectionState;
  
  constructor(private config: DatabaseConfig) {
    this.state = { name: config.name, isConnected: false, activeQueries: 0, lastUsed: new Date() };
  }
  
  async connect(): Promise<void> { this.connected = true; this.state.isConnected = true; }
  async disconnect(): Promise<void> { this.connected = false; this.state.isConnected = false; }
  
  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    this.state.activeQueries++;
    this.state.lastUsed = new Date();
    try { return []; }
    finally { this.state.activeQueries--; }
  }
  
  getState(): ConnectionState { return { ...this.state }; }
}