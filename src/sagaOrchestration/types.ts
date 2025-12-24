export interface Saga<T = unknown> {
  id: string;
  name: string;
  steps: SagaStep<T>[];
  state: SagaState;
  context: T;
  createdAt: Date;
  completedAt?: Date;
}

export interface SagaStep<T = unknown> {
  id: string;
  name: string;
  execute: (context: T) => Promise<T>;
  compensate: (context: T) => Promise<T>;
  status: StepStatus;
  error?: Error;
  executedAt?: Date;
  compensatedAt?: Date;
}

export type SagaState = 'pending' | 'running' | 'completed' | 'compensating' | 'failed' | 'compensated';
export type StepStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'compensating' | 'compensated';

export interface SagaDefinition<T = unknown> {
  name: string;
  steps: StepDefinition<T>[];
  onComplete?: (context: T) => Promise<void>;
  onFail?: (context: T, error: Error) => Promise<void>;
}

export interface StepDefinition<T = unknown> {
  name: string;
  execute: (context: T) => Promise<T>;
  compensate: (context: T) => Promise<T>;
  retries?: number;
  timeout?: number;
}