import { ChangeEvent, TransformConfig } from './types';

export class CDCProcessor {
  private transforms: Transform[] = [];
  
  addTransform(transform: Transform): void { this.transforms.push(transform); }
  
  async process(event: ChangeEvent): Promise<ChangeEvent | null> {
    let result: ChangeEvent | null = event;
    for (const transform of this.transforms) {
      result = await transform.apply(result);
      if (!result) return null;
    }
    return result;
  }
}

export interface Transform {
  apply(event: ChangeEvent): Promise<ChangeEvent | null>;
}

export class FilterTransform implements Transform {
  constructor(private predicate: (event: ChangeEvent) => boolean) {}
  async apply(event: ChangeEvent): Promise<ChangeEvent | null> {
    return this.predicate(event) ? event : null;
  }
}

export class MaskTransform implements Transform {
  constructor(private fields: string[]) {}
  async apply(event: ChangeEvent): Promise<ChangeEvent> {
    const mask = (obj?: Record<string, unknown>) => {
      if (!obj) return obj;
      const masked = { ...obj };
      this.fields.forEach(f => { if (f in masked) masked[f] = '***'; });
      return masked;
    };
    return { ...event, before: mask(event.before), after: mask(event.after) };
  }
}