import { ChangeEvent } from './types';

export class CDCTransformer {
  private transformers: Map<string, (event: ChangeEvent) => ChangeEvent> = new Map();
  
  register(table: string, transformer: (event: ChangeEvent) => ChangeEvent): void {
    this.transformers.set(table, transformer);
  }
  
  transform(event: ChangeEvent): ChangeEvent {
    const transformer = this.transformers.get(event.table);
    return transformer ? transformer(event) : event;
  }
}

export class FieldMasker {
  private masks: Map<string, string[]> = new Map();
  
  mask(table: string, fields: string[]): void { this.masks.set(table, fields); }
  
  apply(event: ChangeEvent): ChangeEvent {
    const fields = this.masks.get(event.table);
    if (!fields) return event;
    
    const maskValue = (obj?: Record<string, unknown>) => {
      if (!obj) return obj;
      const masked = { ...obj };
      fields.forEach(f => { if (f in masked) masked[f] = '***MASKED***'; });
      return masked;
    };
    
    return { ...event, before: maskValue(event.before), after: maskValue(event.after) };
  }
}