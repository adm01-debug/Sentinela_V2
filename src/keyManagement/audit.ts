import { ManagedKey } from './types';

export class KeyAuditLog {
  private logs: AuditEntry[] = [];
  
  log(action: KeyAction, keyId: string, principal: string, details?: Record<string, unknown>): void {
    this.logs.push({ id: Date.now().toString(), action, keyId, principal, timestamp: new Date(), details });
  }
  
  getLogsForKey(keyId: string): AuditEntry[] { return this.logs.filter(l => l.keyId === keyId); }
  
  getLogsByPrincipal(principal: string): AuditEntry[] { return this.logs.filter(l => l.principal === principal); }
  
  getLogsByAction(action: KeyAction): AuditEntry[] { return this.logs.filter(l => l.action === action); }
  
  getLogsInRange(start: Date, end: Date): AuditEntry[] {
    return this.logs.filter(l => l.timestamp >= start && l.timestamp <= end);
  }
  
  generateReport(keyId: string): AuditReport {
    const keyLogs = this.getLogsForKey(keyId);
    const actionCounts: Record<string, number> = {};
    keyLogs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] ?? 0) + 1; });
    
    return {
      keyId,
      totalActions: keyLogs.length,
      actionCounts,
      uniquePrincipals: new Set(keyLogs.map(l => l.principal)).size,
      firstAction: keyLogs[0]?.timestamp,
      lastAction: keyLogs[keyLogs.length - 1]?.timestamp
    };
  }
}

export type KeyAction = 'create' | 'enable' | 'disable' | 'rotate' | 'delete' | 'encrypt' | 'decrypt' | 'policy_attach';
export interface AuditEntry { id: string; action: KeyAction; keyId: string; principal: string; timestamp: Date; details?: Record<string, unknown>; }
export interface AuditReport { keyId: string; totalActions: number; actionCounts: Record<string, number>; uniquePrincipals: number; firstAction?: Date; lastAction?: Date; }