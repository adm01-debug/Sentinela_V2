/**
 * @fileoverview Saga state management
 * @module @sentinela/core/sagaOrchestration
 * @version 13.0.0
 */

import { Saga, SagaState } from './types';

export class SagaStateManager<T = unknown> {
  private states: Map<string, SagaStateRecord<T>> = new Map();

  save(saga: Saga<T>): void {
    this.states.set(saga.id, {
      saga,
      version: (this.states.get(saga.id)?.version ?? 0) + 1,
      updatedAt: new Date()
    });
  }

  load(sagaId: string): Saga<T> | undefined {
    return this.states.get(sagaId)?.saga;
  }

  getHistory(sagaId: string): SagaStateChange[] {
    return [];
  }

  transition(sagaId: string, from: SagaState, to: SagaState): boolean {
    const record = this.states.get(sagaId);
    if (!record || record.saga.state !== from) return false;
    
    if (!this.isValidTransition(from, to)) return false;
    
    record.saga.state = to;
    record.version++;
    record.updatedAt = new Date();
    return true;
  }

  private isValidTransition(from: SagaState, to: SagaState): boolean {
    const transitions: Record<SagaState, SagaState[]> = {
      'pending': ['running'],
      'running': ['completed', 'compensating', 'failed'],
      'completed': [],
      'compensating': ['compensated', 'failed'],
      'failed': [],
      'compensated': []
    };
    return transitions[from]?.includes(to) ?? false;
  }
}

export interface SagaStateRecord<T> {
  saga: Saga<T>;
  version: number;
  updatedAt: Date;
}

export interface SagaStateChange {
  from: SagaState;
  to: SagaState;
  timestamp: Date;
}