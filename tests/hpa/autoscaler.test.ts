import { HPAController, HPA } from '../../src/hpa';

describe('HPAController', () => {
  let controller: HPAController;

  beforeEach(() => {
    controller = new HPAController();
  });

  it('should create HPA', () => {
    const hpa: HPA = {
      name: 'test-hpa',
      namespace: 'default',
      scaleTargetRef: { apiVersion: 'apps/v1', kind: 'Deployment', name: 'my-app' },
      minReplicas: 1,
      maxReplicas: 10,
      metrics: [{ type: 'Resource', resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 80 } } }]
    };

    controller.create(hpa);
    const status = controller.getStatus('default', 'test-hpa');
    expect(status).toBeDefined();
  });

  it('should scale up when CPU is high', () => {
    controller.create({
      name: 'test',
      namespace: 'default',
      scaleTargetRef: { apiVersion: 'apps/v1', kind: 'Deployment', name: 'app' },
      minReplicas: 1,
      maxReplicas: 10,
      metrics: [{ type: 'Resource', resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 50 } } }]
    });

    const decision = controller.reconcile('default', 'test', { cpu: 90, memory: 50 });
    expect(decision.scale).toBe(true);
    expect(decision.replicas).toBeGreaterThan(1);
  });

  it('should not scale below minReplicas', () => {
    controller.create({
      name: 'test',
      namespace: 'default',
      scaleTargetRef: { apiVersion: 'apps/v1', kind: 'Deployment', name: 'app' },
      minReplicas: 2,
      maxReplicas: 10,
      metrics: [{ type: 'Resource', resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 80 } } }]
    });

    const decision = controller.reconcile('default', 'test', { cpu: 10, memory: 10 });
    expect(decision.replicas).toBeGreaterThanOrEqual(2);
  });
});
