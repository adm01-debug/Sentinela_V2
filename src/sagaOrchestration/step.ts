/**
 * @fileoverview Saga step builder
 * @module @sentinela/core/sagaOrchestration
 * @version 13.0.0
 */

import { StepDefinition, StepStatus } from './types';

export class StepBuilder<T = unknown> {
  private step: Partial<StepDefinition<T>> = {};

  name(name: string): this {
    this.step.name = name;
    return this;
  }

  execute(fn: (context: T) => Promise<T>): this {
    this.step.execute = fn;
    return this;
  }

  compensate(fn: (context: T) => Promise<T>): this {
    this.step.compensate = fn;
    return this;
  }

  retries(count: number): this {
    this.step.retries = count;
    return this;
  }

  timeout(ms: number): this {
    this.step.timeout = ms;
    return this;
  }

  build(): StepDefinition<T> {
    if (!this.step.name) throw new Error('Step name is required');
    if (!this.step.execute) throw new Error('Execute function is required');
    if (!this.step.compensate) throw new Error('Compensate function is required');
    return this.step as StepDefinition<T>;
  }
}

export class RetryableStep<T> {
  constructor(
    private step: StepDefinition<T>,
    private maxRetries: number = 3,
    private delayMs: number = 1000
  ) {}

  async execute(context: T): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.step.execute(context);
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, this.delayMs * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError;
  }
}