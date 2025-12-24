// Compensation Manager
import { Saga, SagaState, StepStatus } from './types';

export class CompensationManager {
  private compensationStrategies: Map<string, CompensationStrategy> = new Map();
  private deadLetterQueue: DeadLetterQueue;
  private maxRetries: number;

  constructor(deadLetterQueue: DeadLetterQueue, maxRetries: number = 3) {
    this.deadLetterQueue = deadLetterQueue;
    this.maxRetries = maxRetries;
  }

  registerStrategy(stepName: string, strategy: CompensationStrategy): void {
    this.compensationStrategies.set(stepName, strategy);
  }

  async compensateStep(saga: Saga, stepIndex: number, result: unknown): Promise<CompensationResult> {
    const step = saga.steps[stepIndex];
    const strategy = this.compensationStrategies.get(step.stepName);

    if (!strategy) {
      return {
        success: false,
        error: 'No compensation strategy found for step: ' + step.stepName
      };
    }

    let lastError: Error | undefined;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await strategy.compensate(result, { saga, stepIndex, attempt });
        return { success: true };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    await this.deadLetterQueue.enqueue({
      sagaId: saga.sagaId,
      stepName: step.stepName,
      stepIndex,
      result,
      error: lastError?.message,
      failedAt: new Date()
    });

    return {
      success: false,
      error: lastError?.message ?? 'Unknown error',
      sentToDeadLetter: true
    };
  }

  async compensateAll(saga: Saga, results: Map<string, unknown>): Promise<CompensationSummary> {
    const summary: CompensationSummary = {
      sagaId: saga.sagaId,
      totalSteps: 0,
      compensated: 0,
      failed: 0,
      results: []
    };

    for (let i = saga.currentStep - 1; i >= 0; i--) {
      const step = saga.steps[i];
      if (step.status === StepStatus.Completed) {
        summary.totalSteps++;
        const result = await this.compensateStep(saga, i, results.get(step.stepName));
        summary.results.push({ stepName: step.stepName, ...result });
        
        if (result.success) {
          summary.compensated++;
        } else {
          summary.failed++;
        }
      }
    }

    return summary;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface CompensationStrategy {
  compensate(result: unknown, context: CompensationContext): Promise<void>;
}

export interface CompensationContext {
  saga: Saga;
  stepIndex: number;
  attempt: number;
}

export interface CompensationResult {
  success: boolean;
  error?: string;
  sentToDeadLetter?: boolean;
}

export interface CompensationSummary {
  sagaId: string;
  totalSteps: number;
  compensated: number;
  failed: number;
  results: Array<{ stepName: string } & CompensationResult>;
}

export interface DeadLetterQueue {
  enqueue(item: DeadLetterItem): Promise<void>;
  dequeue(): Promise<DeadLetterItem | null>;
  peek(): Promise<DeadLetterItem | null>;
  size(): Promise<number>;
}

export interface DeadLetterItem {
  sagaId: string;
  stepName: string;
  stepIndex: number;
  result: unknown;
  error?: string;
  failedAt: Date;
}

export class InMemoryDeadLetterQueue implements DeadLetterQueue {
  private queue: DeadLetterItem[] = [];

  async enqueue(item: DeadLetterItem): Promise<void> {
    this.queue.push(item);
  }

  async dequeue(): Promise<DeadLetterItem | null> {
    return this.queue.shift() ?? null;
  }

  async peek(): Promise<DeadLetterItem | null> {
    return this.queue[0] ?? null;
  }

  async size(): Promise<number> {
    return this.queue.length;
  }
}
