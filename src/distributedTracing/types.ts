export interface Span { id: string; name: string; parentId?: string; startTime: number; endTime?: number; tags: Record<string, string>; }
