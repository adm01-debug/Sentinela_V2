import { VPARecommender } from '../../vpa';

describe('VPARecommender', () => {
  let recommender: VPARecommender;
  beforeEach(() => { recommender = new VPARecommender(); });

  it('should recommend resources', async () => {
    recommender.recordMetrics({ cpu: 100, memory: 256 });
    recommender.recordMetrics({ cpu: 150, memory: 300 });
    const recommendation = await recommender.recommend();
    expect(recommendation).toHaveProperty('cpu');
    expect(recommendation).toHaveProperty('memory');
  });
});
