export interface AdmissionRequest { kind: string; spec: unknown; }
export interface AdmissionResponse { allowed: boolean; patches?: unknown[]; }
