export interface HydrationConfig { strategy: HydrationStrategy; rootMargin?: string; threshold?: number; }
export type HydrationStrategy = 'visible' | 'idle' | 'interaction' | 'media' | 'never';
export interface HydrationTarget { id: string; element: string; strategy: HydrationStrategy; hydrated: boolean; }