import { ThreatModel, Asset, Threat, DataFlow, TrustBoundary } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ThreatModelBuilder {
  private model: ThreatModel = { id: uuidv4(), name: '', assets: [], threats: [], dataFlows: [], trustBoundaries: [] };
  
  withName(name: string): this { this.model.name = name; return this; }
  
  addAsset(name: string, type: Asset['type'], sensitivity: Asset['sensitivity']): this {
    this.model.assets.push({ id: uuidv4(), name, type, sensitivity });
    return this;
  }
  
  addThreat(threat: Omit<Threat, 'id'>): this {
    this.model.threats.push({ id: uuidv4(), ...threat });
    return this;
  }
  
  addDataFlow(from: string, to: string, data: string, protocol: string): this {
    this.model.dataFlows.push({ id: uuidv4(), from, to, data, protocol });
    return this;
  }
  
  addTrustBoundary(name: string, assets: string[]): this {
    this.model.trustBoundaries.push({ id: uuidv4(), name, assets });
    return this;
  }
  
  build(): ThreatModel { return { ...this.model }; }
  
  calculateRiskScore(): number {
    if (this.model.threats.length === 0) return 0;
    const total = this.model.threats.reduce((sum, t) => sum + (t.likelihood * t.impact), 0);
    return Math.round((total / this.model.threats.length / 25) * 100);
  }
}