export interface Seeder {
  name: string;
  run(): Promise<void>;
  dependencies?: string[];
}

export interface SeederConfig {
  directory: string;
  order?: string[];
}

export interface FactoryDefinition<T> {
  model: string;
  definition: () => Partial<T>;
  states?: Record<string, () => Partial<T>>;
}