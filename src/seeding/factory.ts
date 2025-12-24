import { Factory } from './types';

export class ModelFactory<T> implements Factory<T> {
  constructor(private generator: () => T) {}
  
  create(overrides?: Partial<T>): T { return { ...this.generator(), ...overrides }; }
  createMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

export class FactoryRegistry {
  private factories: Map<string, Factory<unknown>> = new Map();
  
  register<T>(name: string, factory: Factory<T>): void { this.factories.set(name, factory as Factory<unknown>); }
  get<T>(name: string): Factory<T> | undefined { return this.factories.get(name) as Factory<T> | undefined; }
  
  create<T>(name: string, overrides?: Partial<T>): T | undefined {
    return this.get<T>(name)?.create(overrides);
  }
  
  createMany<T>(name: string, count: number, overrides?: Partial<T>): T[] {
    return this.get<T>(name)?.createMany(count, overrides) ?? [];
  }
}