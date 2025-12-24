import { CompositionConfig, CompositionResult, DataSource } from './types';

export class APIComposer {
  private cache: Map<string, { data: unknown; expiresAt: number }> = new Map();
  
  async compose<T>(config: CompositionConfig, params?: Record<string, unknown>): Promise<CompositionResult<T>> {
    const cacheKey = config.name + ':' + JSON.stringify(params);
    
    if (config.caching?.enabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return { data: cached.data as T, sources: [], timing: {}, cached: true };
      }
    }
    
    const timing: Record<string, number> = {};
    const results: Record<string, unknown> = {};
    
    await Promise.all(config.sources.map(async source => {
      const start = Date.now();
      results[source.name] = await this.fetchSource(source, params);
      timing[source.name] = Date.now() - start;
    }));
    
    let data = this.mergeResults(results) as T;
    
    for (const transform of config.transforms) {
      data = this.applyTransform(data, transform) as T;
    }
    
    if (config.caching?.enabled) {
      this.cache.set(cacheKey, { data, expiresAt: Date.now() + config.caching.ttlMs });
    }
    
    return { data, sources: config.sources.map(s => s.name), timing, cached: false };
  }
  
  private async fetchSource(source: DataSource, params?: Record<string, unknown>): Promise<unknown> {
    return { source: source.name, type: source.type, params };
  }
  
  private mergeResults(results: Record<string, unknown>): unknown {
    return Object.values(results).reduce((acc: any, val: any) => ({ ...acc, ...val }), {});
  }
  
  private applyTransform(data: unknown, transform: any): unknown { return data; }
}