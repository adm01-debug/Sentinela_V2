import { Saga, SagaDefinition, SagaState, SagaStep, StepStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SagaOrchestrator<T = unknown> {
  private sagas: Map<string, Saga<T>> = new Map();
  private definitions: Map<string, SagaDefinition<T>> = new Map();

  register(definition: SagaDefinition<T>): void {
    this.definitions.set(definition.name, definition);
  }

  async start(name: string, initialContext: T): Promise<Saga<T>> {
    const definition = this.definitions.get(name);
    if (!definition) throw new Error('Saga definition not found: ' + name);

    const saga: Saga<T> = {
      id: uuidv4(),
      name,
      steps: definition.steps.map(step => ({
        id: uuidv4(),
        name: step.name,
        execute: step.execute,
        compensate: step.compensate,
        status: 'pending' as StepStatus
      })),
      state: 'pending',
      context: initialContext,
      createdAt: new Date()
    };

    this.sagas.set(saga.id, saga);
    return this.execute(saga);
  }

  private async execute(saga: Saga<T>): Promise<Saga<T>> {
    saga.state = 'running';
    let currentContext = saga.context;

    for (const step of saga.steps) {
      try {
        step.status = 'executing';
        step.executedAt = new Date();
        currentContext = await step.execute(currentContext);
        step.status = 'completed';
        saga.context = currentContext;
      } catch (error) {
        step.status = 'failed';
        step.error = error as Error;
        saga.state = 'compensating';
        await this.compensate(saga);
        return saga;
      }
    }

    saga.state = 'completed';
    saga.completedAt = new Date();
    return saga;
  }

  private async compensate(saga: Saga<T>): Promise<void> {
    const completedSteps = saga.steps.filter(s => s.status === 'completed').reverse();
    
    for (const step of completedSteps) {
      try {
        step.status = 'compensating';
        saga.context = await step.compensate(saga.context);
        step.status = 'compensated';
        step.compensatedAt = new Date();
      } catch (error) {
        saga.state = 'failed';
        return;
      }
    }
    
    saga.state = 'compensated';
  }

  getSaga(id: string): Saga<T> | undefined {
    return this.sagas.get(id);
  }

  listSagas(): Saga<T>[] {
    return Array.from(this.sagas.values());
  }
}