import { Service, Container } from './types';
import { ContainerScheduler } from './scheduler';
import { v4 as uuidv4 } from 'uuid';

export class ServiceManager {
  private services: Map<string, ManagedService> = new Map();
  
  constructor(private scheduler: ContainerScheduler) {}
  
  deploy(service: Service): DeployResult {
    const containers: Container[] = [];
    for (let i = 0; i < service.replicas; i++) {
      const container: Container = { ...service.containers[0], id: uuidv4(), name: service.name + '-' + i };
      const result = this.scheduler.schedule(container);
      if (result.success) containers.push(container);
    }
    
    this.services.set(service.name, { service, containers, status: 'running' });
    return { success: true, deployed: containers.length, requested: service.replicas };
  }
  
  scale(serviceName: string, replicas: number): void {
    const managed = this.services.get(serviceName);
    if (managed) managed.service.replicas = replicas;
  }
  
  getService(name: string): ManagedService | undefined { return this.services.get(name); }
  listServices(): ManagedService[] { return Array.from(this.services.values()); }
}

export interface ManagedService { service: Service; containers: Container[]; status: 'running' | 'stopped' | 'failed'; }
export interface DeployResult { success: boolean; deployed: number; requested: number; }