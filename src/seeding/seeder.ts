/**
 * @fileoverview Database seeder
 * @module @sentinela/core/seeding
 * @version 13.0.0
 */

import { Seeder, SeederConfig } from './types';

export class SeederRunner {
  private seeders: Map<string, Seeder> = new Map();
  
  constructor(private config: SeederConfig) {}
  
  register(seeder: Seeder): void { this.seeders.set(seeder.name, seeder); }
  
  async run(name?: string): Promise<SeederResult> {
    const result: SeederResult = { executed: [], failed: [] };
    const toRun = name ? [this.seeders.get(name)!] : this.getOrdered();
    
    for (const seeder of toRun) {
      if (!seeder) continue;
      try {
        await seeder.run();
        result.executed.push(seeder.name);
      } catch (e) {
        result.failed.push({ name: seeder.name, error: (e as Error).message });
      }
    }
    return result;
  }
  
  private getOrdered(): Seeder[] {
    if (this.config.order.length === 0) return Array.from(this.seeders.values());
    return this.config.order.map(name => this.seeders.get(name)!).filter(Boolean);
  }
}

export interface SeederResult { executed: string[]; failed: { name: string; error: string }[]; }