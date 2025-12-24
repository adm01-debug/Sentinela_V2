import { ServiceClass, ServicePlan } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ServiceCatalog {
  private classes: Map<string, ServiceClass> = new Map();
  
  register(serviceClass: Omit<ServiceClass, 'id'>): ServiceClass {
    const sc: ServiceClass = { id: uuidv4(), ...serviceClass };
    this.classes.set(sc.id, sc);
    return sc;
  }
  
  get(id: string): ServiceClass | undefined { return this.classes.get(id); }
  getByName(name: string): ServiceClass | undefined { return Array.from(this.classes.values()).find(c => c.name === name); }
  
  list(): ServiceClass[] { return Array.from(this.classes.values()); }
  
  getPlan(classId: string, planId: string): ServicePlan | undefined {
    const sc = this.classes.get(classId);
    return sc?.plans.find(p => p.id === planId);
  }
  
  search(query: string): ServiceClass[] {
    const lower = query.toLowerCase();
    return this.list().filter(c => c.name.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower));
  }
}