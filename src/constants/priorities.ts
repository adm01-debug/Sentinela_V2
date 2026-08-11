export const PRIORITIES = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 } as const;
export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];
