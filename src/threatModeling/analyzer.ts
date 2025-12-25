/**
 * @fileoverview Threat Modeling Analyzer
 * @module @sentinela/core/threatModeling
 */
export interface Threat { id: string; name: string; category: string; severity: string; mitigations: string[]; }
export class ThreatAnalyzer {
  private threats: Threat[] = [];
  addThreat(threat: Threat): void { this.threats.push(threat); }
  analyze(system: { components: string[]; dataFlows: string[] }): Threat[] {
    return this.threats.filter(t => system.components.some(c => t.category.includes(c)));
  }
  getMitigations(threatId: string): string[] { return this.threats.find(t => t.id === threatId)?.mitigations ?? []; }
}
