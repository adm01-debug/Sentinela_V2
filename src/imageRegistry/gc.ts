import { ImageRegistry } from './registry';
import { Image } from './types';

export class GarbageCollector {
  constructor(private registry: ImageRegistry) {}
  
  async collectUntagged(repoName: string): Promise<GCResult> {
    const deleted: string[] = [];
    return { deleted, freedBytes: 0 };
  }
  
  async collectOlderThan(repoName: string, days: number): Promise<GCResult> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const deleted: string[] = [];
    return { deleted, freedBytes: 0 };
  }
  
  async collectByPolicy(repoName: string, policy: RetentionPolicy): Promise<GCResult> {
    const tags = this.registry.listTags(repoName);
    const toDelete = tags.slice(policy.keepLast);
    
    for (const tag of toDelete) {
      this.registry.delete(repoName, tag);
    }
    
    return { deleted: toDelete, freedBytes: 0 };
  }
}

export interface RetentionPolicy { keepLast: number; keepDays?: number; keepPatterns?: string[]; }
export interface GCResult { deleted: string[]; freedBytes: number; }