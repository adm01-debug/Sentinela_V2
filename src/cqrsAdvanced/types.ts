export interface Command { type: string; [key: string]: unknown; }
export interface Query { type: string; [key: string]: unknown; }
export interface Handler<T, R> { execute(cmd: T): Promise<R>; }
