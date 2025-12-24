// Saga Orchestrator
import { v4 as uuidv4 } from 'uuid';
import { Saga, SagaState, SagaDefinition, SagaContext, SagaStepResult, StepStatus, SagaMetadata } from './types';

export class SagaOrchestrator {
  private definitions: Map<string, SagaDefinition> = new Map();
  private repository: SagaRepository;
  private eventEmitter: SagaEventEmitter;

  constructor(repository: SagaRepository, eventEmitter?: SagaEventEmitter) {
    this.repository = repository;
    this.eventEmitter = eventEmitter ?? new NoOpEventEmitter();
  }

  register<C>(definition: SagaDefinition<C>): void {
    this.definitions.set(definition.sagaType, definition as SagaDefinition);
  }

  async start<T>(sagaType: string, data: T, metadata?: Partial<SagaMetadata>): Promise<string> {
    const definition = this.definitions.get(sagaType);
    if (!definition) {
      throw new Error('Saga type not found: ' + sagaType);
    }

    const sagaId = uuidv4();
    const saga: Saga = {
      sagaId,
      sagaType,
      state: SagaState.Running,
      currentStep: 0,
      steps: definition.steps.map((step, index) => ({
        stepName: step.name,
        stepIndex: index,
        status: StepStatus.Pending,
        executedAt: new Date()
      })),
      startedAt: new Date(),
      metadata: {
        correlationId: metadata?.correlationId ?? uuidv4(),
        causationId: metadata?.causationId,
        userId: metadata?.userId,
        tenantId: metadata?.tenantId,
        retryCount: 0,
        maxRetries: metadata?.maxRetries ?? 3
      }
    };

    await this.repository.save(saga);
    this.eventEmitter.emit('saga:started', { sagaId, sagaType });

    const context: SagaContext<T> = {
      sagaId,
      data,
      results: new Map()
    };

    this.executeSteps(saga, definition, context);
    return sagaId;
  }

  private async executeSteps<T>(saga: Saga, definition: SagaDefinition, context: SagaContext<T>): Promise<void> {
    for (let i = saga.currentStep; i < definition.steps.length; i++) {
      const stepDef = definition.steps[i];
      saga.steps[i].status = StepStatus.Executing;
      await this.repository.save(saga);

      try {
        const result = await this.executeWithTimeout(
          () => stepDef.execute(context.data),
          stepDef.timeout ?? 30000
        );

        context.results.set(stepDef.name, result);
        saga.steps[i].status = StepStatus.Completed;
        saga.steps[i].result = result;
        saga.currentStep = i + 1;
        await this.repository.save(saga);

        this.eventEmitter.emit('saga:step:completed', {
          sagaId: saga.sagaId,
          stepName: stepDef.name,
          stepIndex: i
        });
      } catch (error) {
        saga.steps[i].status = StepStatus.Failed;
        saga.steps[i].error = error instanceof Error ? error.message : String(error);
        saga.state = SagaState.Failed;
        await this.repository.save(saga);

        this.eventEmitter.emit('saga:step:failed', {
          sagaId: saga.sagaId,
          stepName: stepDef.name,
          error: saga.steps[i].error
        });

        await this.compensate(saga, definition, context);
        return;
      }
    }

    saga.state = SagaState.Completed;
    saga.completedAt = new Date();
    await this.repository.save(saga);

    if (definition.onComplete) {
      await definition.onComplete(context.data);
    }

    this.eventEmitter.emit('saga:completed', { sagaId: saga.sagaId });
  }

  private async compensate<T>(saga: Saga, definition: SagaDefinition, context: SagaContext<T>): Promise<void> {
    saga.state = SagaState.Compensating;
    await this.repository.save(saga);

    for (let i = saga.currentStep - 1; i >= 0; i--) {
      const stepDef = definition.steps[i];
      const stepResult = saga.steps[i];

      if (stepResult.status === StepStatus.Completed) {
        saga.steps[i].status = StepStatus.Compensating;
        await this.repository.save(saga);

        try {
          await stepDef.compensate(context.data, stepResult.result);
          saga.steps[i].status = StepStatus.Compensated;
          saga.steps[i].compensatedAt = new Date();
          await this.repository.save(saga);

          this.eventEmitter.emit('saga:step:compensated', {
            sagaId: saga.sagaId,
            stepName: stepDef.name
          });
        } catch (error) {
          console.error('Compensation failed for step:', stepDef.name, error);
          this.eventEmitter.emit('saga:compensation:failed', {
            sagaId: saga.sagaId,
            stepName: stepDef.name,
            error
          });
        }
      }
    }

    saga.state = SagaState.Compensated;
    saga.completedAt = new Date();
    await this.repository.save(saga);

    if (definition.onFail) {
      await definition.onFail(context.data, new Error('Saga compensated'));
    }

    this.eventEmitter.emit('saga:compensated', { sagaId: saga.sagaId });
  }

  private executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Step timeout')), timeout)
      )
    ]);
  }

  async getSaga(sagaId: string): Promise<Saga | null> {
    return this.repository.findById(sagaId);
  }
}

export interface SagaRepository {
  save(saga: Saga): Promise<void>;
  findById(sagaId: string): Promise<Saga | null>;
  findByCorrelationId(correlationId: string): Promise<Saga[]>;
}

export interface SagaEventEmitter {
  emit(event: string, data: unknown): void;
  on(event: string, handler: (data: unknown) => void): void;
}

class NoOpEventEmitter implements SagaEventEmitter {
  emit(): void {}
  on(): void {}
}
