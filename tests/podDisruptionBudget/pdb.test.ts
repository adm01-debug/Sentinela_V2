import { PDBManager, PodDisruptionBudget } from '../../podDisruptionBudget';
describe('PDBManager', () => {
  let manager: PDBManager;
  beforeEach(() => { manager = new PDBManager(); });
  it('should create PDB with minAvailable', async () => {
    const pdb = await manager.create({
      name: 'web-pdb',
      selector: { matchLabels: { app: 'web' } },
      minAvailable: 2
    });
    expect(pdb.minAvailable).toBe(2);
  });
  it('should create PDB with maxUnavailable', async () => {
    const pdb = await manager.create({
      name: 'api-pdb',
      selector: { matchLabels: { app: 'api' } },
      maxUnavailable: 1
    });
    expect(pdb.maxUnavailable).toBe(1);
  });
  it('should create PDB with percentage', async () => {
    const pdb = await manager.create({
      name: 'percent-pdb',
      selector: { matchLabels: { app: 'batch' } },
      minAvailable: '50%'
    });
    expect(pdb.minAvailable).toBe('50%');
  });
  it('should get PDB status', async () => {
    await manager.create({ name: 'status-pdb', selector: { matchLabels: { app: 'test' } }, minAvailable: 1 });
    const status = await manager.getStatus('status-pdb');
    expect(status.disruptionsAllowed).toBeDefined();
  });
});