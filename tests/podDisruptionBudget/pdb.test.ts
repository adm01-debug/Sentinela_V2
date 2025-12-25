import { PDBManager } from '../../podDisruptionBudget';
describe('PDBManager', () => {
  let manager: PDBManager;
  beforeEach(() => { manager = new PDBManager(); });
  it('should check if disruption allowed', async () => {
    await manager.create({ name: 'api-pdb', minAvailable: 2, selector: { app: 'api' } });
    expect(await manager.canDisrupt('api-pdb', 3)).toBe(true);
    expect(await manager.canDisrupt('api-pdb', 2)).toBe(false);
  });
});
