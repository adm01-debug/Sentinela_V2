/**
 * @fileoverview Pod Disruption Budget
 * @module @sentinela/core/podDisruptionBudget
 */
export interface PDB { name: string; minAvailable?: number; maxUnavailable?: number; selector: Record<string, string>; }
export class PDBManager {
  private pdbs = new Map<string, PDB>();
  async create(pdb: PDB): Promise<void> { this.pdbs.set(pdb.name, pdb); }
  async get(name: string): Promise<PDB | undefined> { return this.pdbs.get(name); }
  async delete(name: string): Promise<void> { this.pdbs.delete(name); }
  async canDisrupt(name: string, currentAvailable: number): Promise<boolean> {
    const pdb = this.pdbs.get(name);
    if (!pdb || !pdb.minAvailable) return true;
    return currentAvailable > pdb.minAvailable;
  }
}
