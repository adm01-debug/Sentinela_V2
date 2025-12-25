import { PodAffinityManager, PodAffinity, PodAntiAffinity } from '../../podAffinity';
describe('PodAffinityManager', () => {
  let manager: PodAffinityManager;
  beforeEach(() => { manager = new PodAffinityManager(); });
  it('should create pod affinity', () => {
    const affinity = manager.affinity({
      labelSelector: { matchLabels: { app: 'web' } },
      topologyKey: 'kubernetes.io/hostname'
    });
    expect(affinity).toBeDefined();
  });
  it('should create pod anti-affinity', () => {
    const antiAffinity = manager.antiAffinity({
      labelSelector: { matchLabels: { app: 'db' } },
      topologyKey: 'kubernetes.io/hostname'
    });
    expect(antiAffinity).toBeDefined();
  });
  it('should create spread constraint', () => {
    const spread = manager.spreadAcrossZones({ app: 'web' });
    expect(spread.topologyKey).toBe('topology.kubernetes.io/zone');
  });
});