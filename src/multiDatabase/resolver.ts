import { DatabaseConfig } from './types';

export class ConnectionResolver {
  private resolvers: Map<string, () => DatabaseConfig> = new Map();
  
  register(name: string, resolver: () => DatabaseConfig): void { this.resolvers.set(name, resolver); }
  
  resolve(name: string): DatabaseConfig | undefined {
    const resolver = this.resolvers.get(name);
    return resolver ? resolver() : undefined;
  }
  
  resolveForModel(model: string): DatabaseConfig | undefined {
    return this.resolve(this.getConnectionName(model));
  }
  
  private getConnectionName(model: string): string { return 'default'; }
}

export class TenantResolver {
  private tenantConnections: Map<string, DatabaseConfig> = new Map();
  
  setForTenant(tenantId: string, config: DatabaseConfig): void { this.tenantConnections.set(tenantId, config); }
  getForTenant(tenantId: string): DatabaseConfig | undefined { return this.tenantConnections.get(tenantId); }
  
  resolveTenant(): string { return 'default'; }
  getCurrentConnection(): DatabaseConfig | undefined { return this.getForTenant(this.resolveTenant()); }
}