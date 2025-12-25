import { VPARecommender, ResourceRecommendation, ContainerMetrics } from '../../vpa';

describe('VPARecommender', () => {
  let recommender: VPARecommender;

  beforeEach(() => {
    recommender = new VPARecommender({
      minCPU: '10m',
      maxCPU: '4',
      minMemory: '64Mi',
      maxMemory: '8Gi'
    });
  });

  it('should recommend resources based on usage', async () => {
    const metrics: ContainerMetrics[] = [
      { cpu: 0.5, memory: 512, timestamp: new Date() },
      { cpu: 0.7, memory: 600, timestamp: new Date() },
      { cpu: 0.6, memory: 550, timestamp: new Date() }
    ];

    const recommendation = await recommender.recommend(metrics);

    expect(recommendation.cpu).toBeDefined();
    expect(recommendation.memory).toBeDefined();
  });

  it('should respect min/max bounds', async () => {
    const highMetrics: ContainerMetrics[] = [
      { cpu: 10, memory: 20000, timestamp: new Date() }
    ];

    const recommendation = await recommender.recommend(highMetrics);

    expect(parseFloat(recommendation.cpu)).toBeLessThanOrEqual(4);
  });

  it('should handle empty metrics', async () => {
    const recommendation = await recommender.recommend([]);
    expect(recommendation).toBeNull();
  });

  it('should calculate percentiles', () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const p95 = recommender.calculatePercentile(values, 95);
    
    expect(p95).toBeGreaterThanOrEqual(90);
  });
});
