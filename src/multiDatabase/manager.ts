import { DatabaseConfig, ConnectionState } from './types';

export class MultiDatabaseManager {
  private configs: Map<string, DatabaseConfig> = new Map();
  private states: Map<string, ConnectionState> = new Map();
  private defaultDb?: string;
  
  register(config: DatabaseConfig, isDefault?: boolean): void {
    this.configs.set(config.name, config);
    this.states.set(config.name, { name: config.name, connected: false, lastUsed: new Date(), queryCount: 0 });
    if (isDefault) this.defaultDb = config.name;
  }
  
  async connect(name: string): Promise<void> {
    const config = this.configs.get(name);
    if (!config) throw new Error('Database not found: ' + name);
    const state = this.states.get(name)!;
    state.connected = true;
    console.log('Connected to', name);
  }
  
  async disconnect(name: string): Promise<void> {
    const state = this.states.get(name);
    if (state) state.connected = false;
  }
  
  getConnection(name?: string): DatabaseConfig | undefined {
    const dbName = name ?? this.defaultDb;
    return dbName ? this.configs.get(dbName) : undefined;
  }
  
  getStats(): Map<string, ConnectionState> { return new Map(this.states); }
  
  async query<T>(name: string, sql: string): Promise<T[]> {
    const state = this.states.get(name);
    if (!state?.connected) throw new Error('Not connected: ' + name);
    state.queryCount++;
    state.lastUsed = new Date();
    return [];
  }
}