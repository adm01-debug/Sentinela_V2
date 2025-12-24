// Saga Pattern Types
export interface Saga {
  readonly sagaId: string;
  readonly sagaType: string;
  readonly state: SagaState;
  readonly currentStep: number;
  readonly steps: SagaStepResult[];
  readonly startedAt: Date;
  readonly completedAt?: Date;
  readonly metadata: SagaMetadata;
}

export enum SagaState {
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Compensating = 'compensating',
  Compensated = 'compensated'
}

export interface SagaMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  tenantId?: string;
  retryCount: number;
  maxRetries: number;
}

export interface SagaStepResult {
  stepName: string;
  stepIndex: number;
  status: StepStatus;
  result?: unknown;
  error?: string;
  executedAt: Date;
  compensatedAt?: Date;
}

export enum StepStatus {
  Pending = 'pending',
  Executing = 'executing',
  Completed = 'completed',
  Failed = 'failed',
  Compensating = 'compensating',
  Compensated = 'compensated'
}

export interface SagaDefinition<C = unknown> {
  sagaType: string;
  steps: SagaStepDefinition<C>[];
  onComplete?: (context: C) => Promise<void>;
  onFail?: (context: C, error: Error) => Promise<void>;
}

export interface SagaStepDefinition<C = unknown> {
  name: string;
  execute: (context: C) => Promise<unknown>;
  compensate: (context: C, result: unknown) => Promise<void>;
  retryable?: boolean;
  timeout?: number;
}

export interface SagaContext<T = unknown> {
  sagaId: string;
  data: T;
  results: Map<string, unknown>;
}
