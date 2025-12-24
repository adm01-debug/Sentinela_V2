import { LimitRangeItem, ResourceValues } from './types';

export class LimitRangeValidator {
  validate(request: { limits?: ResourceValues; requests?: ResourceValues }, limits: LimitRangeItem): ValidationResult {
    const errors: string[] = [];
    
    if (limits.min) {
      if (request.requests?.cpu && this.parseResource(request.requests.cpu) < this.parseResource(limits.min.cpu ?? '0')) {
        errors.push('CPU request below minimum');
      }
      if (request.requests?.memory && this.parseResource(request.requests.memory) < this.parseResource(limits.min.memory ?? '0')) {
        errors.push('Memory request below minimum');
      }
    }
    
    if (limits.max) {
      if (request.limits?.cpu && this.parseResource(request.limits.cpu) > this.parseResource(limits.max.cpu ?? 'Infinity')) {
        errors.push('CPU limit above maximum');
      }
      if (request.limits?.memory && this.parseResource(request.limits.memory) > this.parseResource(limits.max.memory ?? 'Infinity')) {
        errors.push('Memory limit above maximum');
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  private parseResource(value: string): number {
    if (value === 'Infinity') return Infinity;
    const num = parseFloat(value);
    if (value.endsWith('m')) return num / 1000;
    if (value.endsWith('Gi')) return num * 1024 * 1024 * 1024;
    if (value.endsWith('Mi')) return num * 1024 * 1024;
    return num;
  }
}

export interface ValidationResult { valid: boolean; errors: string[]; }