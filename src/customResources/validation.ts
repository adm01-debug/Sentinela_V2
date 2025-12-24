import { CustomResource, JSONSchema, CustomResourceDefinition } from './types';

export class CRDValidator {
  validate(resource: CustomResource, crd: CustomResourceDefinition): ValidationResult {
    const errors: string[] = [];
    const version = crd.spec.versions.find(v => 'v1' === v.name || v.storage);
    
    if (!version?.schema?.openAPIV3Schema) return { valid: true, errors: [] };
    
    this.validateObject(resource.spec, version.schema.openAPIV3Schema, 'spec', errors);
    return { valid: errors.length === 0, errors };
  }
  
  private validateObject(obj: unknown, schema: JSONSchema, path: string, errors: string[]): void {
    if (schema.type === 'object' && typeof obj !== 'object') {
      errors.push(path + ' must be an object');
      return;
    }
    
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in (obj as Record<string, unknown>))) {
          errors.push(path + '.' + field + ' is required');
        }
      }
    }
    
    if (schema.properties && typeof obj === 'object' && obj) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          this.validateObject((obj as Record<string, unknown>)[key], propSchema, path + '.' + key, errors);
        }
      }
    }
  }
}

export interface ValidationResult { valid: boolean; errors: string[]; }