export interface PodSecurityPolicy { name: string; spec: PSPSpec; }
export interface PSPSpec { privileged: boolean; hostNetwork: boolean; hostPID: boolean; hostIPC: boolean; runAsUser: RunAsUserStrategy; fsGroup: FSGroupStrategy; volumes: string[]; allowedCapabilities?: string[]; requiredDropCapabilities?: string[]; }
export interface RunAsUserStrategy { rule: 'MustRunAs' | 'MustRunAsNonRoot' | 'RunAsAny'; ranges?: { min: number; max: number }[]; }
export interface FSGroupStrategy { rule: 'MustRunAs' | 'RunAsAny'; ranges?: { min: number; max: number }[]; }