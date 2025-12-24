import { ServiceInstance, InstanceStatus } from './types';
import { ServiceCatalog } from './catalog';
import { v4 as uuidv4 } from 'uuid';

export class ServiceProvisioner {
  private instances: Map<string, ServiceInstance> = new Map();
  
  constructor(private catalog: ServiceCatalog) {}
  
  async provision(classId: string, planId: string, parameters: Record<string, unknown>): Promise<ServiceInstance> {
    const sc = this.catalog.get(classId);
    if (!sc) throw new Error('Service class not found');
    
    const plan = sc.plans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    
    const instance: ServiceInstance = { id: uuidv4(), classId, planId, parameters, status: 'provisioning' };
    this.instances.set(instance.id, instance);
    
    setTimeout(() => { instance.status = 'ready'; }, 100);
    return instance;
  }
  
  async deprovision(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.status = 'deleting';
      setTimeout(() => this.instances.delete(instanceId), 100);
    }
  }
  
  getInstance(id: string): ServiceInstance | undefined { return this.instances.get(id); }
  listInstances(): ServiceInstance[] { return Array.from(this.instances.values()); }
}