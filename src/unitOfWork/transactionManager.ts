export interface TransactionManager {
  begin(): Promise<Transaction>;
  commit(tx: Transaction): Promise<void>;
  rollback(tx: Transaction): Promise<void>;
}

export interface Transaction { id: string; startedAt: Date; status: TransactionStatus; }
export enum TransactionStatus { Active = 'active', Committed = 'committed', RolledBack = 'rolled_back' }

export class InMemoryTransactionManager implements TransactionManager {
  private transactions: Map<string, Transaction> = new Map();
  private counter: number = 0;

  async begin(): Promise<Transaction> {
    const tx: Transaction = { id: 'tx_' + (++this.counter), startedAt: new Date(), status: TransactionStatus.Active };
    this.transactions.set(tx.id, tx);
    return tx;
  }

  async commit(tx: Transaction): Promise<void> {
    const t = this.transactions.get(tx.id);
    if (!t || t.status !== TransactionStatus.Active) throw new Error('Invalid transaction');
    t.status = TransactionStatus.Committed;
  }

  async rollback(tx: Transaction): Promise<void> {
    const t = this.transactions.get(tx.id);
    if (!t || t.status !== TransactionStatus.Active) throw new Error('Invalid transaction');
    t.status = TransactionStatus.RolledBack;
  }
}

export class TransactionScope {
  static async run<T>(manager: TransactionManager, work: (tx: Transaction) => Promise<T>): Promise<T> {
    const tx = await manager.begin();
    try { const result = await work(tx); await manager.commit(tx); return result; }
    catch (error) { await manager.rollback(tx); throw error; }
  }
}
