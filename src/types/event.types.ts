export type EventHandler<T = void> = (event: T) => void;
export type EventEmitter<T extends Record<string, any>> = { on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void; off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void; emit<K extends keyof T>(event: K, data: T[K]): void; };
