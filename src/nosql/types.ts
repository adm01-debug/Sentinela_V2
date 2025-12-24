export interface Document { _id: string; [key: string]: unknown; }
export interface KeyValueEntry { key: string; value: unknown; ttl?: number; createdAt: Date; }
export interface GraphNode { id: string; labels: string[]; properties: Record<string, unknown>; }
export interface GraphEdge { id: string; type: string; from: string; to: string; properties: Record<string, unknown>; }