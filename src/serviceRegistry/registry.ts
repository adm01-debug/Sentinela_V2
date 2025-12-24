import { ServiceDefinition, ServiceRegistration, RegistrationStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ServiceRegistry {
  private registrations: Map<string, ServiceRegistration> = new Map();
  
  register(service: ServiceDefinition): string {
    const id = uuidv4();
    this.registrations.set(id, {
      id, service, status: RegistrationStatus.Active, registeredAt: new Date(), lastHeartbeat: new Date()
    });
    return id;
  }
  
  deregister(id: string): boolean { return this.registrations.delete(id); }
  
  heartbeat(id: string): boolean {
    const reg = this.registrations.get(id);
    if (reg) { reg.lastHeartbeat = new Date(); return true; }
    return false;
  }
  
  find(name: string, version?: string): ServiceRegistration[] {
    return Array.from(this.registrations.values()).filter(r => 
      r.service.name === name && r.status === RegistrationStatus.Active &&
      (!version || r.service.version === version)
    );
  }
  
  findOne(name: string): ServiceRegistration | undefined {
    const services = this.find(name);
    return services[Math.floor(Math.random() * services.length)];
  }
  
  getAll(): ServiceRegistration[] { return Array.from(this.registrations.values()); }
  
  setStatus(id: string, status: RegistrationStatus): boolean {
    const reg = this.registrations.get(id);
    if (reg) { reg.status = status; return true; }
    return false;
  }
}