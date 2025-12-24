export interface Model { id: string; name: string; version: string; framework: string; metrics: Record<string, number>; artifacts: string[]; }
export interface ModelVersion { modelId: string; version: string; stage: ModelStage; createdAt: Date; }
export type ModelStage = 'development' | 'staging' | 'production' | 'archived';