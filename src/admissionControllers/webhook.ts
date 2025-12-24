import { AdmissionRequest, AdmissionResponse } from './types';
import { ValidatingWebhook } from './validator';
import { MutatingWebhook } from './mutator';

export class WebhookServer {
  private validatingWebhooks: Map<string, ValidatingWebhook> = new Map();
  private mutatingWebhooks: Map<string, MutatingWebhook> = new Map();
  
  registerValidating(name: string, webhook: ValidatingWebhook): void { this.validatingWebhooks.set(name, webhook); }
  registerMutating(name: string, webhook: MutatingWebhook): void { this.mutatingWebhooks.set(name, webhook); }
  
  handleValidate(name: string, request: AdmissionRequest): AdmissionResponse {
    const webhook = this.validatingWebhooks.get(name);
    if (!webhook) return { uid: request.uid, allowed: true };
    return webhook.validate(request);
  }
  
  handleMutate(name: string, request: AdmissionRequest): AdmissionResponse {
    const webhook = this.mutatingWebhooks.get(name);
    if (!webhook) return { uid: request.uid, allowed: true };
    return webhook.mutate(request);
  }
}