import { Seeder, SeederConfig } from './types';

export class SeederManager {
  private seeders: Map<string, Seeder> = new Map();
  private executed: Set<string> = new Set();
  
  constructor(private config: SeederConfig) {}
  
  register(seeder: Seeder): void { this.seeders.set(seeder.name, seeder); }
  
  async run(name?: string): Promise<string[]> {
    if (name) {
      await this.runSeeder(name);
      return [name];
    }
    const order = this.config.order ?? Array.from(this.seeders.keys());
    for (const seederName of order) await this.runSeeder(seederName);
    return order;
  }
  
  private async runSeeder(name: string): Promise<void> {
    if (this.executed.has(name)) return;
    const seeder = this.seeders.get(name);
    if (!seeder) throw new Error('Seeder not found: ' + name);
    if (seeder.dependencies) {
      for (const dep of seeder.dependencies) await this.runSeeder(dep);
    }
    await seeder.run();
    this.executed.add(name);
  }
  
  async reset(): Promise<void> { this.executed.clear(); }
  getExecuted(): string[] { return Array.from(this.executed); }
}

export abstract class BaseSeeder implements Seeder {
  abstract name: string;
  dependencies?: string[];
  abstract run(): Promise<void>;
  
  protected async insert(table: string, data: Record<string, unknown>[]): Promise<void> {
    console.log('Inserting', data.length, 'records into', table);
  }
  
  protected async truncate(table: string): Promise<void> {
    console.log('Truncating', table);
  }
}