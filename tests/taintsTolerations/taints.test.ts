import { TaintsManager } from '../../taintsTolerations';
describe('TaintsManager', () => {
  it('should add taint', async () => {
    const manager = new TaintsManager();
    await manager.addTaint('node-1', { key: 'dedicated', value: 'gpu', effect: 'NoSchedule' });
    const taints = await manager.getTaints('node-1');
    expect(taints.length).toBeGreaterThan(0);
  });
});
