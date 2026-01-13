export const first = <T>(arr: T[]): T | undefined => arr[0];
export const last = <T>(arr: T[]): T | undefined => arr[arr.length - 1];
export const isEmpty = <T>(arr: T[]): boolean => arr.length === 0;
export const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
export const sample = <T>(arr: T[]): T | undefined => arr[Math.floor(Math.random() * arr.length)];
