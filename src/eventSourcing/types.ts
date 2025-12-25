export interface Event { type: string; version: number; data: unknown; timestamp?: Date; }
export interface Snapshot { state: unknown; version: number; }
