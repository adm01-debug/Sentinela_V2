import { ThreatModel, Asset, Threat, DataFlow, TrustBoundary } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ThreatModelBuilder {
  private model: ThreatModel = { id: uuidv4(), name: '', assets: [], threats: [], dataFlows: [], trustBoundaries: [] };
  
  withName(name: string): this { this.model.name = name; return this; }
  addAsset(asset: Omit<Asset, 'id'>): this { this.model.assets.push({ id: uuidv4(), ...asset }); return this; }
  addThreat(threat: Omit<Threat, 'id'>): this { this.model.threats.push({ id: uuidv4(), ...threat }); return this; }
  addDataFlow(flow: Omit<DataFlow, 'id'>): this { this.model.dataFlows.push({ id: uuidv4(), ...flow }); return this; }
  addTrustBoundary(boundary: Omit<TrustBoundary, 'id'>): this { this.model.trustBoundaries.push({ id: uuidv4(), ...boundary }); return this; }
  
  build(): ThreatModel { return { ...this.model }; }
  
  calculateRisk(): number {
    if (this.model.threats.length === 0) return 0;
    return this.model.threats.reduce((sum, t) => sum + t.likelihood * t.impact, 0) / this.model.threats.length;
  }
}