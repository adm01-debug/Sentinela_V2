export class DataAggregator {
  aggregate<T>(sources: T[], strategy: AggregationStrategy): T {
    switch (strategy) {
      case 'merge': return this.merge(sources);
      case 'first': return sources[0];
      case 'last': return sources[sources.length - 1];
      default: return this.merge(sources);
    }
  }
  
  private merge<T>(sources: T[]): T {
    return sources.reduce((acc: any, src: any) => {
      if (Array.isArray(acc) && Array.isArray(src)) return [...acc, ...src];
      if (typeof acc === 'object' && typeof src === 'object') return { ...acc, ...src };
      return src;
    }, {} as T);
  }
}

export type AggregationStrategy = 'merge' | 'first' | 'last';