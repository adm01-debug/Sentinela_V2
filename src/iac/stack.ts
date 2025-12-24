import { Stack, Resource, Output } from './types';

export class StackBuilder {
  private stack: Stack = { name: '', resources: [], outputs: [] };
  
  name(name: string): this { this.stack.name = name; return this; }
  
  addResource(resource: Resource): this {
    this.stack.resources.push(resource);
    return this;
  }
  
  addOutput(output: Output): this {
    this.stack.outputs.push(output);
    return this;
  }
  
  build(): Stack { return { ...this.stack }; }
  
  toJSON(): string { return JSON.stringify(this.stack, null, 2); }
}

export class StackValidator {
  validate(stack: Stack): ValidationResult {
    const errors: string[] = [];
    if (!stack.name) errors.push('Stack name required');
    
    const names = new Set<string>();
    stack.resources.forEach(r => {
      if (names.has(r.name)) errors.push('Duplicate resource: ' + r.name);
      names.add(r.name);
    });
    
    return { valid: errors.length === 0, errors };
  }
}

export interface ValidationResult { valid: boolean; errors: string[]; }