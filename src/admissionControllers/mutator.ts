import { AdmissionRequest, AdmissionResponse } from './types';

export abstract class MutatingWebhook {
  abstract mutate(request: AdmissionRequest): AdmissionResponse;
  
  protected allowWithPatch(uid: string, patches: JSONPatch[]): AdmissionResponse {
    return { uid, allowed: true, patch: JSON.stringify(patches), patchType: 'JSONPatch' };
  }
  
  protected allow(uid: string): AdmissionResponse { return { uid, allowed: true }; }
}

export interface JSONPatch { op: 'add' | 'remove' | 'replace'; path: string; value?: unknown; }

export class DefaultsMutator extends MutatingWebhook {
  constructor(private defaults: { path: string; value: unknown }[]) { super(); }
  
  mutate(request: AdmissionRequest): AdmissionResponse {
    const patches: JSONPatch[] = this.defaults.map(d => ({ op: 'add', path: d.path, value: d.value }));
    return this.allowWithPatch(request.uid, patches);
  }
}

export class LabelInjector extends MutatingWebhook {
  constructor(private labels: Record<string, string>) { super(); }
  
  mutate(request: AdmissionRequest): AdmissionResponse {
    const patches: JSONPatch[] = Object.entries(this.labels).map(([key, value]) => ({
      op: 'add', path: '/metadata/labels/' + key.replace(/\//g, '~1'), value
    }));
    return this.allowWithPatch(request.uid, patches);
  }
}