/**
 * @fileoverview CDN manager
 * @module @sentinela/core/cdn
 * @version 13.0.0
 */

import { CDNConfig, Origin, CacheRule, CDNStats } from './types';

export class CDNManager {
  private config: CDNConfig;
  private stats: CDNStats = { hits: 0, misses: 0, bandwidth: 0, requests: 0 };
  
  constructor(config: CDNConfig) { this.config = config; }
  
  selectOrigin(): Origin {
    const available = this.config.origins.filter(o => !o.backup);
    const total = available.reduce((sum, o) => sum + o.weight, 0);
    let random = Math.random() * total;
    for (const origin of available) {
      random -= origin.weight;
      if (random <= 0) return origin;
    }
    return available[0];
  }
  
  getCacheRule(path: string): CacheRule | undefined {
    return this.config.cacheRules.find(r => path.startsWith(r.path) || new RegExp(r.path).test(path));
  }
  
  recordHit(bytes: number): void { this.stats.hits++; this.stats.requests++; this.stats.bandwidth += bytes; }
  recordMiss(bytes: number): void { this.stats.misses++; this.stats.requests++; this.stats.bandwidth += bytes; }
  
  getStats(): CDNStats & { hitRate: number } {
    return { ...this.stats, hitRate: this.stats.requests ? this.stats.hits / this.stats.requests : 0 };
  }
}