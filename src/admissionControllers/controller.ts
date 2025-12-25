/**
 * @fileoverview Admission Controller
 * @module @sentinela/core/admissionControllers
 */
export interface AdmissionRequest { kind: string; spec: unknown; }
export interface AdmissionResponse { allowed: boolean; patches?: unknown[]; }
export class AdmissionController {
  private validators: Array<(req: AdmissionRequest) => boolean> = [];
  private mutators: Array<(req: AdmissionRequest) => unknown[]> = [];
  addValidator(fn: (req: AdmissionRequest) => boolean): void { this.validators.push(fn); }
  addMutator(fn: (req: AdmissionRequest) => unknown[]): void { this.mutators.push(fn); }
  async validate(req: AdmissionRequest): Promise<{ allowed: boolean }> {
    return { allowed: this.validators.every(v => v(req)) };
  }
  async mutate(req: AdmissionRequest): Promise<{ patches: unknown[] }> {
    return { patches: this.mutators.flatMap(m => m(req)) };
  }
}
