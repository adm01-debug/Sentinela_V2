export interface PrefetchConfig { maxPrefetches: number; idleOnly: boolean; saveData: boolean; }
export interface PrefetchRequest { url: string; priority: number; timestamp: Date; }
export interface PrefetchResult { url: string; success: boolean; size?: number; duration?: number; }