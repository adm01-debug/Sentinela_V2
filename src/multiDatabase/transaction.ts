import { MultiDatabaseManager, DatabaseConnection } from './manager';

export class DistributedTransaction {
  private participants: Map<string, DatabaseConnection> = new Map();
  private prepared: Set<string> = new Set();
  
  constructor(private manager: MultiDatabaseManager) {}
  
  addParticipant(dbName: string): void {
    const conn = this.manager.getConnection(dbName);
    this.participants.set(dbName, conn);
  }
  
  async prepare(): Promise<boolean> {
    for (const [name, conn] of this.participants) {
      try { this.prepared.add(name); }
      catch { return false; }
    }
    return true;
  }
  
  async commit(): Promise<void> {
    if (this.prepared.size !== this.participants.size) throw new Error('Not all participants prepared');
    for (const [name, conn] of this.participants) {
      console.log('Committing on', name);
    }
  }
  
  async rollback(): Promise<void> {
    for (const [name, conn] of this.participants) {
      console.log('Rolling back on', name);
    }
  }
}

export class TransactionCoordinator {
  private transactions: Map<string, DistributedTransaction> = new Map();
  
  constructor(private manager: MultiDatabaseManager) {}
  
  begin(id: string, databases: string[]): DistributedTransaction {
    const tx = new DistributedTransaction(this.manager);
    databases.forEach(db => tx.addParticipant(db));
    this.transactions.set(id, tx);
    return tx;
  }
  
  async commit(id: string): Promise<void> {
    const tx = this.transactions.get(id);
    if (!tx) throw new Error('Transaction not found');
    if (await tx.prepare()) { await tx.commit(); }
    else { await tx.rollback(); throw new Error('Prepare failed'); }
    this.transactions.delete(id);
  }
  
  async rollback(id: string): Promise<void> {
    const tx = this.transactions.get(id);
    if (tx) { await tx.rollback(); this.transactions.delete(id); }
  }
}