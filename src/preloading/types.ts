export interface PreloadResource { url: string; type: ResourceType; priority: 'high' | 'low' | 'auto'; crossOrigin?: boolean; }
export type ResourceType = 'script' | 'style' | 'image' | 'font' | 'fetch' | 'document';
export interface PreloadConfig { maxConcurrent: number; priorityBoost: string[]; exclude: string[]; }