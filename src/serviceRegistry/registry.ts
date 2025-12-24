import { ServiceDefinition, EndpointDefinition } from './types';

export class ServiceRegistry {
  private services: Map<string, ServiceDefinition> = new Map();
  private listeners: Map<string, Set<(service: ServiceDefinition) => void>> = new Map();
  
  register(service: ServiceDefinition): void {
    this.services.set(service.name, service);
    this.notifyListeners(service.name, service);
  }
  
  deregister(name: string): void { this.services.delete(name); }
  
  get(name: string): ServiceDefinition | undefined { return this.services.get(name); }
  getAll(): ServiceDefinition[] { return Array.from(this.services.values()); }
  
  getEndpoints(name: string): EndpointDefinition[] {
    return this.services.get(name)?.endpoints ?? [];
  }
  
  watch(name: string, callback: (service: ServiceDefinition) => void): () => void {
    const listeners = this.listeners.get(name) ?? new Set();
    listeners.add(callback);
    this.listeners.set(name, listeners);
    return () => listeners.delete(callback);
  }
  
  private notifyListeners(name: string, service: ServiceDefinition): void {
    this.listeners.get(name)?.forEach(cb => cb(service));
  }
}