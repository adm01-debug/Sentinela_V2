import { offlineQueue, QueuedAction } from './offlineQueue';
import { offlineManager } from './offlineManager';
export type SyncHandler = (action: QueuedAction) => Promise<boolean>;
export class OfflineSync {
  private handlers = new Map<string, SyncHandler>();
  private syncing = false;
  registerHandler(type: string, handler: SyncHandler): void { this.handlers.set(type, handler); }
  async sync(): Promise<{ success: number; failed: number }> { if (this.syncing || offlineManager.getStatus()) return { success: 0, failed: 0 }; this.syncing = true; let success = 0, failed = 0; const actions = offlineQueue.getAll(); for (const action of actions) { const handler = this.handlers.get(action.type); if (handler) { try { const result = await handler(action); if (result) { offlineQueue.remove(action.id); success++; } else { offlineQueue.incrementRetry(action.id); failed++; } } catch { offlineQueue.incrementRetry(action.id); failed++; } } } this.syncing = false; return { success, failed }; }
}
export const offlineSync = new OfflineSync();
