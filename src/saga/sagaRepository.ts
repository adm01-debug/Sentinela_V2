// Saga Repository Implementation
import { Saga, SagaState } from './types';

export interface SagaRepository {
  save(saga: Saga): Promise<void>;
  findById(sagaId: string): Promise<Saga | null>;
  findByCorrelationId(correlationId: string): Promise<Saga[]>;
  findByState(state: SagaState): Promise<Saga[]>;
  findPending(): Promise<Saga[]>;
  delete(sagaId: string): Promise<void>;
}

export class InMemorySagaRepository implements SagaRepository {
  private sagas: Map<string, Saga> = new Map();

  async save(saga: Saga): Promise<void> {
    this.sagas.set(saga.sagaId, { ...saga });
  }

  async findById(sagaId: string): Promise<Saga | null> {
    const saga = this.sagas.get(sagaId);
    return saga ? { ...saga } : null;
  }

  async findByCorrelationId(correlationId: string): Promise<Saga[]> {
    return Array.from(this.sagas.values())
      .filter(s => s.metadata.correlationId === correlationId);
  }

  async findByState(state: SagaState): Promise<Saga[]> {
    return Array.from(this.sagas.values())
      .filter(s => s.state === state);
  }

  async findPending(): Promise<Saga[]> {
    return Array.from(this.sagas.values())
      .filter(s => s.state === SagaState.Running || s.state === SagaState.Compensating);
  }

  async delete(sagaId: string): Promise<void> {
    this.sagas.delete(sagaId);
  }
}

export class SagaRecoveryService {
  private repository: SagaRepository;
  private checkIntervalMs: number;
  private timeoutMs: number;
  private timer?: NodeJS.Timeout;

  constructor(repository: SagaRepository, checkIntervalMs: number = 60000, timeoutMs: number = 300000) {
    this.repository = repository;
    this.checkIntervalMs = checkIntervalMs;
    this.timeoutMs = timeoutMs;
  }

  start(): void {
    this.timer = setInterval(() => this.checkAndRecover(), this.checkIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async checkAndRecover(): Promise<RecoveryReport> {
    const pendingSagas = await this.repository.findPending();
    const report: RecoveryReport = {
      checked: pendingSagas.length,
      recovered: 0,
      failed: 0,
      timedOut: 0
    };

    for (const saga of pendingSagas) {
      const age = Date.now() - new Date(saga.startedAt).getTime();
      
      if (age > this.timeoutMs) {
        report.timedOut++;
        console.warn('Saga timed out:', saga.sagaId, 'Type:', saga.sagaType);
      }
    }

    return report;
  }
}

export interface RecoveryReport {
  checked: number;
  recovered: number;
  failed: number;
  timedOut: number;
}

export class SagaQueryService {
  private repository: SagaRepository;

  constructor(repository: SagaRepository) {
    this.repository = repository;
  }

  async getSagaStatus(sagaId: string): Promise<SagaStatusDTO | null> {
    const saga = await this.repository.findById(sagaId);
    if (!saga) return null;

    return {
      sagaId: saga.sagaId,
      sagaType: saga.sagaType,
      state: saga.state,
      progress: this.calculateProgress(saga),
      currentStep: saga.steps[saga.currentStep - 1]?.stepName ?? 'Not started',
      startedAt: saga.startedAt,
      completedAt: saga.completedAt,
      duration: saga.completedAt 
        ? new Date(saga.completedAt).getTime() - new Date(saga.startedAt).getTime()
        : Date.now() - new Date(saga.startedAt).getTime()
    };
  }

  private calculateProgress(saga: Saga): number {
    if (saga.state === SagaState.Completed) return 100;
    if (saga.steps.length === 0) return 0;
    return Math.round((saga.currentStep / saga.steps.length) * 100);
  }

  async getSagasByUser(userId: string): Promise<SagaStatusDTO[]> {
    const allSagas = await this.repository.findByState(SagaState.Running);
    const userSagas = allSagas.filter(s => s.metadata.userId === userId);
    return Promise.all(userSagas.map(s => this.getSagaStatus(s.sagaId) as Promise<SagaStatusDTO>));
  }
}

export interface SagaStatusDTO {
  sagaId: string;
  sagaType: string;
  state: SagaState;
  progress: number;
  currentStep: string;
  startedAt: Date;
  completedAt?: Date;
  duration: number;
}
