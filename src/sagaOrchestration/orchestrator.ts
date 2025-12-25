/**
 * @fileoverview Saga Orchestrator implementation  
 * @module @sentinela/core/sagaOrchestration
 * @version 13.0.0
 */

export type SagaState = 'pending' | 'running' | 'completed' | 'failed' | 'compensating' | 'compensated';

export interface SagaStep<T> {
  name: string;
  execute: (context: T) => Promise<T>;
  compensate?: (context: T) => Promise<T>;
}

export interface SagaDefinition<T> {
  name: string;
  steps: SagaStep<T>[];
}

export interface SagaInstance<T> {
  id: string;
  name: string;
  state: SagaState;
  context: T;
  currentStep: number;
  completedSteps: string[];
  error?: Error;
}

export class SagaOrchestrator<T = Record<string, unknown>> {
  private sagas = new Map<string, SagaDefinition<T>>();
  private instances = new Map<string, SagaInstance<T>>();
  private idCounter = 0;

  register(saga: SagaDefinition<T>): void {
    this.sagas.set(saga.name, saga);
  }

  async start(sagaName: string, context: T): Promise<SagaInstance<T>> {
    const saga = this.sagas.get(sagaName);
    if (!saga) throw new Error('Saga not found: ' + sagaName);

    const instance: SagaInstance<T> = {
      id: String(++this.idCounter),
      name: sagaName,
      state: 'running',
      context,
      currentStep: 0,
      completedSteps: []
    };

    this.instances.set(instance.id, instance);

    try {
      for (let i = 0; i < saga.steps.length; i++) {
        const step = saga.steps[i];
        instance.currentStep = i;
        instance.context = await step.execute(instance.context);
        instance.completedSteps.push(step.name);
      }
      instance.state = 'completed';
    } catch (error) {
      instance.error = error as Error;
      instance.state = 'compensating';
      await this.compensate(instance, saga);
    }

    return instance;
  }

  private async compensate(instance: SagaInstance<T>, saga: SagaDefinition<T>): Promise<void> {
    for (let i = instance.completedSteps.length - 1; i >= 0; i--) {
      const stepName = instance.completedSteps[i];
      const step = saga.steps.find(s => s.name === stepName);
      if (step?.compensate) {
        try {
          instance.context = await step.compensate(instance.context);
        } catch { /* compensation failed */ }
      }
    }
    instance.state = 'compensated';
  }

  getInstance(id: string): SagaInstance<T> | undefined {
    return this.instances.get(id);
  }
}

export class StepBuilder<T> {
  private step: Partial<SagaStep<T>> = {};

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

  build(): SagaStep<T> {
    if (!this.step.name || !this.step.execute) {
      throw new Error('Step requires name and execute');
    }
    return this.step as SagaStep<T>;
  }
}
