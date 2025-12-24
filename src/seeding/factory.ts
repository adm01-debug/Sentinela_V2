import { FactoryDefinition } from './types';

export class Factory<T> {
  private definition: () => Partial<T>;
  private states: Record<string, () => Partial<T>> = {};
  private afterCreate: Array<(entity: T) => void> = [];
  
  constructor(def: FactoryDefinition<T>) {
    this.definition = def.definition;
    this.states = def.states ?? {};
  }
  
  state(name: string): this {
    const stateDefinition = this.states[name];
    if (stateDefinition) {
      const original = this.definition;
      this.definition = () => ({ ...original(), ...stateDefinition() });
    }
    return this;
  }
  
  afterCreating(callback: (entity: T) => void): this { this.afterCreate.push(callback); return this; }
  
  make(overrides?: Partial<T>): T {
    const entity = { ...this.definition(), ...overrides } as T;
    return entity;
  }
  
  makeMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.make(overrides));
  }
  
  async create(overrides?: Partial<T>): Promise<T> {
    const entity = this.make(overrides);
    this.afterCreate.forEach(cb => cb(entity));
    return entity;
  }
  
  async createMany(count: number, overrides?: Partial<T>): Promise<T[]> {
    return Promise.all(Array.from({ length: count }, () => this.create(overrides)));
  }
}

export class FactoryRegistry {
  private factories: Map<string, Factory<unknown>> = new Map();
  
  define<T>(name: string, definition: FactoryDefinition<T>): Factory<T> {
    const factory = new Factory(definition);
    this.factories.set(name, factory as Factory<unknown>);
    return factory;
  }
  
  get<T>(name: string): Factory<T> {
    const factory = this.factories.get(name);
    if (!factory) throw new Error('Factory not found: ' + name);
    return factory as Factory<T>;
  }
}