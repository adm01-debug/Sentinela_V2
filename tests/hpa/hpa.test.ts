import { HPAController } from '../../hpa';

describe('HPAController', () => {
  let controller: HPAController;
  beforeEach(() => { controller = new HPAController({ minReplicas: 1, maxReplicas: 10, targetCPU: 80 }); });

  it('should scale up on high CPU', async () => {
    controller.updateMetrics({ cpu: 95, memory: 50 });
    const decision = await controller.evaluate();
    expect(decision.action).toBe('scale-up');
  });

  it('should scale down on low CPU', async () => {
    controller.setReplicas(5);
    controller.updateMetrics({ cpu: 20, memory: 30 });
    const decision = await controller.evaluate();
    expect(decision.action).toBe('scale-down');
  });

  it('should respect min replicas', async () => {
    controller.setReplicas(1);
    controller.updateMetrics({ cpu: 5, memory: 10 });
    const decision = await controller.evaluate();
    expect(decision.replicas).toBeGreaterThanOrEqual(1);
  });
});
