export interface Namespace { name: string; labels?: Record<string, string>; annotations?: Record<string, string>; status: NamespaceStatus; }
export type NamespaceStatus = 'Active' | 'Terminating';
export interface NamespaceConfig { defaultResourceQuota?: ResourceQuota; defaultLimitRange?: LimitRange; networkPolicy?: string; }
export interface ResourceQuota { cpu: string; memory: string; pods: number; }
export interface LimitRange { defaultCpu: string; defaultMemory: string; maxCpu: string; maxMemory: string; }