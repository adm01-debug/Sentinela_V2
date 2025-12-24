export interface CIPipeline { id: string; name: string; stages: CIStage[]; triggers: Trigger[]; variables: Record<string, string>; }
export interface CIStage { name: string; jobs: CIJob[]; dependsOn?: string[]; }
export interface CIJob { name: string; steps: Step[]; runner: string; }
export interface Step { name: string; command: string; timeout?: number; }
export interface Trigger { type: 'push' | 'pr' | 'schedule' | 'manual'; config: Record<string, unknown>; }