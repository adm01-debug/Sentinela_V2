/**
 * @fileoverview Service discovery implementation
 * @module @sentinela/core/serviceDiscovery
 * @version 13.0.0
 */

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