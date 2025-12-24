export interface Taint { key: string; value?: string; effect: TaintEffect; }
export type TaintEffect = 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
export interface Toleration { key?: string; operator?: 'Equal' | 'Exists'; value?: string; effect?: TaintEffect; tolerationSeconds?: number; }
export interface Node { name: string; taints: Taint[]; }