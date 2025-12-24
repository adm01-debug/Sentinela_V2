import { ServiceDefinition, ServiceHealth } from './types';

export class ServiceRegistry {
  private services: Map<string, RegisteredService> = new Map();
  
  register(definition: ServiceDefinition): string {
    const id = definition.name + '-' + Date.now();
    this.services.set(id, {
      id,
      definition,
      health: { status: 'healthy', lastCheck: new Date(), latency: 0 },
      registeredAt: new Date()
    });
    return id;
  }
  
  deregister(id: string): boolean { return this.services.delete(id); }
  
  lookup(name: string): RegisteredService[] {
    return Array.from(this.services.values())
      .filter(s => s.definition.name === name && s.health.status !== 'unhealthy');
  }
  
  lookupByTag(tag: string): RegisteredService[] {
    return Array.from(this.services.values())
      .filter(s => s.definition.tags.includes(tag) && s.health.status !== 'unhealthy');
  }
  
  updateHealth(id: string, health: ServiceHealth): void {
    const service = this.services.get(id);
    if (service) service.health = health;
  }
  
  getAll(): RegisteredService[] { return Array.from(this.services.values()); }
}

export interface RegisteredService {
  id: string;
  definition: ServiceDefinition;
  health: ServiceHealth;
  registeredAt: Date;
}