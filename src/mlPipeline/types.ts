export interface PipelineStep { name: string; transform: (data: unknown) => Promise<unknown>; }
