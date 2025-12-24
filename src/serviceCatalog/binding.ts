import { ServiceInstance } from './types';

export interface ServiceBinding { id: string; instanceId: string; credentials: Record<string, string>; createdAt: Date; }

export class BindingManager {
  private bindings: Map<string, ServiceBinding> = new Map();
  
  bind(instance: ServiceInstance): ServiceBinding {
    const binding: ServiceBinding = {
      id: Date.now().toString(),
      instanceId: instance.id,
      credentials: this.generateCredentials(instance),
      createdAt: new Date()
    };
    this.bindings.set(binding.id, binding);
    return binding;
  }
  
  unbind(bindingId: string): boolean { return this.bindings.delete(bindingId); }
  
  getBinding(id: string): ServiceBinding | undefined { return this.bindings.get(id); }
  
  getBindingsForInstance(instanceId: string): ServiceBinding[] {
    return Array.from(this.bindings.values()).filter(b => b.instanceId === instanceId);
  }
  
  private generateCredentials(instance: ServiceInstance): Record<string, string> {
    return {
      host: 'localhost',
      port: '5432',
      username: 'user_' + instance.id.slice(0, 8),
      password: Math.random().toString(36).slice(2)
    };
  }
}