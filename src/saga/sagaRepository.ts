// Saga Repository - Persistence
import { SagaState, SagaStatus } from "./sagaOrchestrator";

export interface SagaRepository<TContext = Record<string, unknown>> {
  save(state: SagaState<TContext>): Promise<void>;
  findById(id: string): Promise<SagaState<TContext> | null>;
  findByStatus(status: SagaStatus): Promise<SagaState<TContext>[]>;
  findPending(): Promise<SagaState<TContext>[]>;
  update(state: SagaState<TContext>): Promise<void>;
  delete(id: string): Promise<void>;
}

export class InMemorySagaRepository<TContext extends Record<string, unknown>> implements SagaRepository<TContext> {
  private sagas: Map<string, SagaState<TContext>> = new Map();

  async save(state: SagaState<TContext>): Promise<void> {
    this.sagas.set(state.id, { ...state });
  }

  async findById(id: string): Promise<SagaState<TContext> | null> {
    return this.sagas.get(id) || null;
  }

  async findByStatus(status: SagaStatus): Promise<SagaState<TContext>[]> {
    return Array.from(this.sagas.values()).filter(s => s.status === status);
  }

  async findPending(): Promise<SagaState<TContext>[]> {
    return this.findByStatus("pending");
  }

  async update(state: SagaState<TContext>): Promise<void> {
    if (!this.sagas.has(state.id)) throw new Error(`Saga ${state.id} not found`);
    this.sagas.set(state.id, { ...state });
  }

  async delete(id: string): Promise<void> {
    this.sagas.delete(id);
  }
}

export class SagaRecoveryService<TContext extends Record<string, unknown>> {
  constructor(private repository: SagaRepository<TContext>) {}

  async recoverStuckSagas(maxAge: number = 3600000): Promise<SagaState<TContext>[]> {
    const running = await this.repository.findByStatus("running");
    const stuck = running.filter(s => Date.now() - s.startedAt.getTime() > maxAge);
    for (const saga of stuck) {
      saga.status = "failed";
      saga.error = "Saga recovery: marked as failed due to timeout";
      await this.repository.update(saga);
    }
    return stuck;
  }
}
