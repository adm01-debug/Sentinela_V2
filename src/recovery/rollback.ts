export interface RollbackState { id: string; entityType: string; entityId: string; previousState: any; currentState: any; timestamp: Date; }
export class RollbackManager {
  private states: RollbackState[] = [];
  save(entityType: string, entityId: string, previousState: any, currentState: any): string { const state: RollbackState = { id: crypto.randomUUID(), entityType, entityId, previousState, currentState, timestamp: new Date() }; this.states.push(state); return state.id; }
  rollback(id: string): any | null { const state = this.states.find(s => s.id === id); return state?.previousState || null; }
  getHistory(entityType: string, entityId: string): RollbackState[] { return this.states.filter(s => s.entityType === entityType && s.entityId === entityId); }
  clear(): void { this.states = []; }
}
export const rollbackManager = new RollbackManager();
