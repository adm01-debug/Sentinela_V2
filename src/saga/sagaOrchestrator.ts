// Saga Orchestrator - Distributed Transactions
export interface SagaStep<TContext = Record<string, unknown>> {
  name: string;
  execute(context: TContext): Promise<void>;
  compensate(context: TContext): Promise<void>;
}

export interface SagaDefinition<TContext = Record<string, unknown>> {
  name: string;
  steps: SagaStep<TContext>[];
}

export type SagaStatus = "pending" | "running" | "completed" | "compensating" | "failed" | "compensated";

export interface SagaState<TContext = Record<string, unknown>> {
  id: string;
  name: string;
  status: SagaStatus;
  context: TContext;
  currentStep: number;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export class SagaOrchestrator<TContext extends Record<string, unknown> = Record<string, unknown>> {
  private sagas: Map<string, SagaState<TContext>> = new Map();

  constructor(private definition: SagaDefinition<TContext>) {}

  async execute(sagaId: string, initialContext: TContext): Promise<SagaState<TContext>> {
    const state: SagaState<TContext> = {
      id: sagaId,
      name: this.definition.name,
      status: "running",
      context: { ...initialContext },
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date()
    };
    this.sagas.set(sagaId, state);

    try {
      for (let i = 0; i < this.definition.steps.length; i++) {
        const step = this.definition.steps[i];
        state.currentStep = i;
        await step.execute(state.context);
        state.completedSteps.push(step.name);
      }
      state.status = "completed";
      state.completedAt = new Date();
    } catch (error) {
      state.status = "compensating";
      state.failedStep = this.definition.steps[state.currentStep].name;
      state.error = error instanceof Error ? error.message : String(error);
      await this.compensate(state);
    }

    return state;
  }

  private async compensate(state: SagaState<TContext>): Promise<void> {
    const stepsToCompensate = [...state.completedSteps].reverse();
    for (const stepName of stepsToCompensate) {
      const step = this.definition.steps.find(s => s.name === stepName);
      if (step) {
        try {
          await step.compensate(state.context);
        } catch (compError) {
          console.error(`Compensation failed for step ${stepName}:`, compError);
        }
      }
    }
    state.status = "compensated";
    state.completedAt = new Date();
  }

  getState(sagaId: string): SagaState<TContext> | undefined {
    return this.sagas.get(sagaId);
  }
}
