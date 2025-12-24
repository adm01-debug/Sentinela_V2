import { BoundedContext } from './types';

export class ContextBoundary {
  private context: BoundedContext;
  private validators: Map<string, (data: unknown) => boolean> = new Map();
  
  constructor(context: BoundedContext) { this.context = context; }
  
  addValidator(eventType: string, validator: (data: unknown) => boolean): this {
    this.validators.set(eventType, validator);
    return this;
  }
  
  canAccept(eventType: string, data: unknown): boolean {
    const validator = this.validators.get(eventType);
    return validator ? validator(data) : true;
  }
  
  getContext(): BoundedContext { return this.context; }
}