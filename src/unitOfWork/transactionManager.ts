// Transaction Manager
export interface Transaction {
  id: string;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

export interface TransactionManager {
  begin(): Promise<Transaction>;
  current(): Transaction | null;
  runInTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}

export class InMemoryTransaction implements Transaction {
  private active = false;
  
  constructor(public readonly id: string = crypto.randomUUID()) {}

  async begin(): Promise<void> {
    this.active = true;
  }

  async commit(): Promise<void> {
    this.active = false;
  }

  async rollback(): Promise<void> {
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }
}

export class InMemoryTransactionManager implements TransactionManager {
  private currentTx: Transaction | null = null;

  async begin(): Promise<Transaction> {
    if (this.currentTx?.isActive()) {
      throw new Error("Transaction already active");
    }
    const tx = new InMemoryTransaction();
    await tx.begin();
    this.currentTx = tx;
    return tx;
  }

  current(): Transaction | null {
    return this.currentTx?.isActive() ? this.currentTx : null;
  }

  async runInTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    const tx = await this.begin();
    try {
      const result = await fn(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }
}
