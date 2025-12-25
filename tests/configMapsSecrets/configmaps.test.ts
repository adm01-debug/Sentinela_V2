import { ConfigMapManager } from '../../configMapsSecrets';
describe('ConfigMapManager', () => {
  it('should create configmap', async () => {
    const manager = new ConfigMapManager();
    await manager.create({ name: 'app-config', data: { key: 'value' } });
    const cm = await manager.get('app-config');
    expect(cm.data.key).toBe('value');
  });
});
