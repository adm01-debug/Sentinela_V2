import { PDBManager } from '../../podDisruptionBudget';

describe('PDBManager', () => {
  it('should create PDB', async () => {
    const manager = new PDBManager();
    const pdb = await manager.create({ name: 'api-pdb', minAvailable: 2 });
    expect(pdb.minAvailable).toBe(2);
  });
});
