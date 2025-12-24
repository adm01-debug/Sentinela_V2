export class DataTransformer {
  private transformers: Map<string, (data: unknown) => unknown> = new Map();
  
  register(name: string, transformer: (data: unknown) => unknown): void {
    this.transformers.set(name, transformer);
  }
  
  transform(name: string, data: unknown): unknown {
    const transformer = this.transformers.get(name);
    if (!transformer) throw new Error('Transformer not found: ' + name);
    return transformer(data);
  }
  
  pipe(data: unknown, ...names: string[]): unknown {
    return names.reduce((d, name) => this.transform(name, d), data);
  }
}

export const CommonTransformers = {
  flatten: (data: unknown) => Array.isArray(data) ? data.flat() : data,
  unique: (data: unknown) => Array.isArray(data) ? [...new Set(data)] : data,
  sort: (data: unknown) => Array.isArray(data) ? [...data].sort() : data,
  pick: (keys: string[]) => (data: unknown) => {
    if (typeof data !== 'object' || !data) return data;
    return keys.reduce((r, k) => ({ ...r, [k]: (data as Record<string, unknown>)[k] }), {});
  },
  omit: (keys: string[]) => (data: unknown) => {
    if (typeof data !== 'object' || !data) return data;
    const result = { ...(data as Record<string, unknown>) };
    keys.forEach(k => delete result[k]);
    return result;
  }
};