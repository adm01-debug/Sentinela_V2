import { ServiceRegistry, RegisteredService } from './registry';

export class ServiceWatcher {
  private watchers: Map<string, Set<ServiceCallback>> = new Map();
  
  constructor(private registry: ServiceRegistry) {}
  
  watch(serviceName: string, callback: ServiceCallback): () => void {
    const callbacks = this.watchers.get(serviceName) ?? new Set();
    callbacks.add(callback);
    this.watchers.set(serviceName, callbacks);
    return () => callbacks.delete(callback);
  }
  
  notify(serviceName: string, event: ServiceEvent): void {
    const callbacks = this.watchers.get(serviceName);
    if (callbacks) callbacks.forEach(cb => cb(event));
  }
  
  startPolling(intervalMs: number = 5000): NodeJS.Timeout {
    return setInterval(() => {
      this.registry.getAll().forEach(service => {
        this.notify(service.definition.name, { type: 'update', service });
      });
    }, intervalMs);
  }
}

export type ServiceCallback = (event: ServiceEvent) => void;
export interface ServiceEvent {
  type: 'register' | 'deregister' | 'update' | 'healthChange';
  service: RegisteredService;
}