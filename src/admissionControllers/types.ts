export interface AdmissionRequest { uid: string; kind: GroupVersionKind; resource: GroupVersionResource; name: string; namespace?: string; operation: Operation; object: unknown; oldObject?: unknown; }
export interface AdmissionResponse { uid: string; allowed: boolean; status?: { code: number; message: string }; patch?: string; patchType?: 'JSONPatch'; }
export interface GroupVersionKind { group: string; version: string; kind: string; }
export interface GroupVersionResource { group: string; version: string; resource: string; }
export type Operation = 'CREATE' | 'UPDATE' | 'DELETE' | 'CONNECT';