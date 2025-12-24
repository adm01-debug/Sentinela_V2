export interface CustomResourceDefinition { apiVersion: string; kind: string; metadata: { name: string }; spec: CRDSpec; }
export interface CRDSpec { group: string; names: CRDNames; scope: 'Namespaced' | 'Cluster'; versions: CRDVersion[]; }
export interface CRDNames { plural: string; singular: string; kind: string; shortNames?: string[]; }
export interface CRDVersion { name: string; served: boolean; storage: boolean; schema?: { openAPIV3Schema: JSONSchema }; }
export interface JSONSchema { type: string; properties?: Record<string, JSONSchema>; required?: string[]; }
export interface CustomResource { apiVersion: string; kind: string; metadata: { name: string; namespace?: string }; spec: Record<string, unknown>; }