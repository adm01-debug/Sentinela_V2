export class DataTransformer {
  private transformers: Map<string, (data: unknown, config: unknown) => unknown> = new Map();
  
  constructor() {
    this.registerBuiltIn();
  }
  
  register(name: string, fn: (data: unknown, config: unknown) => unknown): void {
    this.transformers.set(name, fn);
  }
  
  transform(data: unknown, transformName: string, config?: unknown): unknown {
    const transformer = this.transformers.get(transformName);
    if (!transformer) throw new Error('Unknown transformer: ' + transformName);
    return transformer(data, config);
  }
  
  private registerBuiltIn(): void {
    this.register('pick', (data: any, keys: string[]) => {
      const result: any = {};
      keys.forEach(k => { if (k in data) result[k] = data[k]; });
      return result;
    });
    
    this.register('omit', (data: any, keys: string[]) => {
      const result = { ...data };
      keys.forEach(k => delete result[k]);
      return result;
    });
    
    this.register('rename', (data: any, mapping: Record<string, string>) => {
      const result: any = {};
      Object.keys(data).forEach(k => { result[mapping[k] ?? k] = data[k]; });
      return result;
    });
    
    this.register('flatten', (data: any) => {
      const result: any = {};
      const flatten = (obj: any, prefix = '') => {
        Object.keys(obj).forEach(k => {
          const key = prefix ? prefix + '.' + k : k;
          if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) flatten(obj[k], key);
          else result[key] = obj[k];
        });
      };
      flatten(data);
      return result;
    });
  }
}