import { SagaStep } from './types';

export class CompensationStrategy<T = unknown> {
  private compensations: Map<string, CompensationHandler<T>> = new Map();

  register(stepName: string, handler: CompensationHandler<T>): void {
    this.compensations.set(stepName, handler);
  }

  async compensate(step: SagaStep<T>, context: T): Promise<T> {
    const handler = this.compensations.get(step.name);
    if (handler) {
      return handler.handle(context, step.error);
    }
    return step.compensate(context);
  }
}

export interface CompensationHandler<T> {
  handle(context: T, error?: Error): Promise<T>;
}

export class CompensationLog<T = unknown> {
  private logs: CompensationEntry<T>[] = [];

  record(sagaId: string, stepName: string, context: T, success: boolean, error?: Error): void {
    this.logs.push({
      sagaId,
      stepName,
      context,
      success,
      error,
      timestamp: new Date()
    });
  }

  getForSaga(sagaId: string): CompensationEntry<T>[] {
    return this.logs.filter(l => l.sagaId === sagaId);
  }

  getFailures(): CompensationEntry<T>[] {
    return this.logs.filter(l => !l.success);
  }
}

export interface CompensationEntry<T> {
  sagaId: string;
  stepName: string;
  context: T;
  success: boolean;
  error?: Error;
  timestamp: Date;
}