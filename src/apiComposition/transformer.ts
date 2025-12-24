export class ResponseTransformer {
  private transforms: Transform[] = [];
  
  addTransform(transform: Transform): this { this.transforms.push(transform); return this; }
  
  transform(data: unknown): unknown {
    return this.transforms.reduce((result, t) => t.apply(result), data);
  }
}

export interface Transform {
  apply(data: unknown): unknown;
}

export class MapTransform implements Transform {
  constructor(private fn: (item: unknown) => unknown) {}
  apply(data: unknown): unknown {
    return Array.isArray(data) ? data.map(this.fn) : this.fn(data);
  }
}

export class FilterTransform implements Transform {
  constructor(private predicate: (item: unknown) => boolean) {}
  apply(data: unknown): unknown {
    return Array.isArray(data) ? data.filter(this.predicate) : data;
  }
}

export class RenameTransform implements Transform {
  constructor(private mapping: Record<string, string>) {}
  apply(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) return data;
    const result: Record<string, unknown> = {};
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      result[this.mapping[key] ?? key] = value;
    });
    return result;
  }
}