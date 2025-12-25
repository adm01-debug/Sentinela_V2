/**
 * Integration test for Kubernetes patterns
 */
import { HPAController } from '../../src/hpa';
import { PDBManager } from '../../src/podDisruptionBudget';
describe('Kubernetes Integration', () => {
  it('should scale based on metrics', async () => {
    const hpa = new HPAController({ minReplicas: 2, maxReplicas: 10, targetCPU: 70 });
    hpa.updateMetrics({ cpu: 85, memory: 50 });
    const result = await hpa.evaluate();
    expect(result.action).toBe('scale-up');
  });
  it('should check disruption budget', async () => {
    const pdb = new PDBManager();
    await pdb.create({ name: 'test', minAvailable: 2, selector: {} });
    expect(await pdb.canDisrupt('test', 3)).toBe(true);
  });
});
