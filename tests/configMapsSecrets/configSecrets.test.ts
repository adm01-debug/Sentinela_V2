import { ConfigMapManager, SecretManager, ConfigMap, Secret } from '../../configMapsSecrets';
describe('ConfigMapManager', () => {
  let manager: ConfigMapManager;
  beforeEach(() => { manager = new ConfigMapManager(); });
  it('should create configmap', async () => {
    const cm = await manager.create({
      name: 'app-config',
      namespace: 'default',
      data: { 'config.yaml': 'key: value' }
    });
    expect(cm.data['config.yaml']).toBe('key: value');
  });
  it('should update configmap', async () => {
    await manager.create({ name: 'update-test', data: { key: 'old' } });
    await manager.update('update-test', { key: 'new' });
    const cm = await manager.get('update-test');
    expect(cm.data.key).toBe('new');
  });
});
describe('SecretManager', () => {
  let manager: SecretManager;
  beforeEach(() => { manager = new SecretManager(); });
  it('should create secret', async () => {
    const secret = await manager.create({
      name: 'db-creds',
      type: 'Opaque',
      data: { password: 'secret123' }
    });
    expect(secret.data.password).toBeDefined();
  });
  it('should encode data as base64', async () => {
    const secret = await manager.create({ name: 'encoded', data: { key: 'value' } });
    expect(Buffer.from(secret.data.key, 'base64').toString()).toBe('value');
  });
});