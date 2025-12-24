import { Manifest } from './types';
import { Reconciler, ReconcileActions } from './reconciler';

export class DriftDetector {
  private reconciler: Reconciler;
  private history: DriftReport[] = [];
  
  constructor() { this.reconciler = new Reconciler(); }
  
  detect(desired: Manifest[], actual: Manifest[]): DriftReport {
    this.reconciler.setDesired(desired);
    this.reconciler.setActual(actual);
    const actions = this.reconciler.reconcile();
    
    const report: DriftReport = {
      timestamp: new Date(),
      hasDrift: actions.create.length > 0 || actions.update.length > 0 || actions.delete.length > 0,
      additions: actions.create.length,
      modifications: actions.update.length,
      deletions: actions.delete.length,
      details: actions
    };
    
    this.history.push(report);
    return report;
  }
  
  getHistory(): DriftReport[] { return [...this.history]; }
}

export interface DriftReport { timestamp: Date; hasDrift: boolean; additions: number; modifications: number; deletions: number; details: ReconcileActions; }