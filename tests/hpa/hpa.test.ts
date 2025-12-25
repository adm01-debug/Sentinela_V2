import { HPAController, ScalingMetrics, HPAPolicy } from '../../hpa';

describe('HPAController', () => {
  let controller: HPAController;

  beforeEach(() => {
    controller = new HPAController({
      minReplicas: 1,
      maxReplicas: 10,
      targetCPUUtilization: 80,
      scaleUpCooldown: 60,
      scaleDownCooldown: 300
    });
  });

  it('should calculate desired replicas based on CPU', () => {
    const metrics: ScalingMetrics = {
      currentReplicas: 2,
      currentCPU: 90,
      currentMemory: 50
    };

    const desired = controller.calculateDesiredReplicas(metrics);
    expect(desired).toBeGreaterThan(2);
  });

  it('should not exceed max replicas', () => {
    const metrics: ScalingMetrics = {
      currentReplicas: 8,
      currentCPU: 100,
      currentMemory: 100
    };

    const desired = controller.calculateDesiredReplicas(metrics);
    expect(desired).toBeLessThanOrEqual(10);
  });

  it('should not go below min replicas', () => {
    const metrics: ScalingMetrics = {
      currentReplicas: 3,
      currentCPU: 10,
      currentMemory: 10
    };

    const desired = controller.calculateDesiredReplicas(metrics);
    expect(desired).toBeGreaterThanOrEqual(1);
  });

  it('should respect cooldown period', async () => {
    controller.recordScaleEvent('up');
    const canScale = controller.canScale('up');

    expect(canScale).toBe(false);
  });
});

describe('HPAPolicy', () => {
  it('should validate scaling policy', () => {
    const policy: HPAPolicy = {
      type: 'Utilization',
      value: 80,
      periodSeconds: 60
    };

    expect(HPAPolicy.validate(policy)).toBe(true);
  });

  it('should reject invalid policy', () => {
    const policy: HPAPolicy = {
      type: 'Utilization',
      value: 150, // Invalid: > 100
      periodSeconds: 60
    };

    expect(HPAPolicy.validate(policy)).toBe(false);
  });
});
