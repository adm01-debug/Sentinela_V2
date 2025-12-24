import { ServiceInstance, ServiceRegistry } from './types';

export class ServiceDiscovery {
  constructor(private registry: ServiceRegistry) {}
  
  async discover(serviceName: string): Promise<ServiceInstance[]> { return this.registry.getInstances(serviceName); }
  
  async discoverOne(serviceName: string): Promise<ServiceInstance | null> {
    const instances = await this.discover(serviceName);
    return instances[Math.floor(Math.random() * instances.length)] ?? null;
  }
  
  async getServiceUrl(serviceName: string): Promise<string | null> {
    const instance = await this.discoverOne(serviceName);
    return instance ? 'http://' + instance.host + ':' + instance.port : null;
  }
}