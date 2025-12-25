import { HPAController } from '../../hpa';
describe('HPAController', () => {
  it('should scale up when CPU high', async () => {
    const hpa = new HPAController({ minReplicas: 2, maxReplicas: 10, targetCPU: 70 });
    hpa.updateMetrics({ cpu: 85, memory: 50 });
    const decision = await hpa.evaluate();
    expect(decision.action).toBe('scale-up');
    expect(decision.replicas).toBe(3);
  });
  it('should scale down when CPU low', async () => {
    const hpa = new HPAController({ minReplicas: 2, maxReplicas: 10, targetCPU: 70 });
    hpa.updateMetrics({ cpu: 85, memory: 50 }); await hpa.evaluate();
    hpa.updateMetrics({ cpu: 20, memory: 50 });
    const decision = await hpa.evaluate();
    expect(decision.action).toBe('scale-down');
  });
});
