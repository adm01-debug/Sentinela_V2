import { OperatorConfig, ReconcileRequest, ReconcileResult } from './types';

export abstract class Operator {
  protected running: boolean = false;
  
  constructor(protected config: OperatorConfig) {}
  
  async start(): Promise<void> {
    this.running = true;
    console.log('Operator', this.config.name, 'started');
    await this.watch();
  }
  
  stop(): void { this.running = false; }
  
  protected abstract reconcile(request: ReconcileRequest): Promise<ReconcileResult>;
  
  private async watch(): Promise<void> {
    while (this.running) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  async handleEvent(event: ResourceEvent): Promise<void> {
    const request: ReconcileRequest = { name: event.object.metadata.name, namespace: event.object.metadata.namespace };
    const result = await this.reconcile(request);
    
    if (result.requeue) {
      setTimeout(() => this.handleEvent(event), result.requeueAfter ?? 5000);
    }
  }
}

export interface ResourceEvent { type: 'ADDED' | 'MODIFIED' | 'DELETED'; object: { metadata: { name: string; namespace?: string } }; }