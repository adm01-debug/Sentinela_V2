import { VPARecommender } from '../../vpa';
describe('VPARecommender', () => {
  it('should recommend resources', () => {
    const vpa = new VPARecommender();
    vpa.addSample(80, 256);
    vpa.addSample(100, 300);
    const rec = vpa.recommend();
    expect(rec.cpu).toBeDefined();
    expect(rec.memory).toBeDefined();
  });
});
