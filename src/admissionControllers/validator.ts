import { AdmissionRequest, AdmissionResponse } from './types';

export abstract class ValidatingWebhook {
  abstract validate(request: AdmissionRequest): AdmissionResponse;
  
  protected allow(uid: string): AdmissionResponse { return { uid, allowed: true }; }
  protected deny(uid: string, message: string, code: number = 403): AdmissionResponse {
    return { uid, allowed: false, status: { code, message } };
  }
}

export class CompositeValidator extends ValidatingWebhook {
  private validators: ValidatingWebhook[] = [];
  
  add(validator: ValidatingWebhook): void { this.validators.push(validator); }
  
  validate(request: AdmissionRequest): AdmissionResponse {
    for (const validator of this.validators) {
      const response = validator.validate(request);
      if (!response.allowed) return response;
    }
    return this.allow(request.uid);
  }
}

export class ResourceValidator extends ValidatingWebhook {
  constructor(private rules: ValidationRule[]) { super(); }
  
  validate(request: AdmissionRequest): AdmissionResponse {
    for (const rule of this.rules) {
      if (!rule.validate(request.object)) return this.deny(request.uid, rule.message);
    }
    return this.allow(request.uid);
  }
}

export interface ValidationRule { validate: (object: unknown) => boolean; message: string; }