export interface SagaStep<T> { name: string; execute: (ctx: T) => Promise<T>; compensate?: (ctx: T) => Promise<T>; }
export interface Saga<T> { name: string; steps: SagaStep<T>[]; }
