import { NamespaceManager, Namespace, NamespaceQuota } from '../../namespaceManagement';
describe('NamespaceManager', () => {
  let manager: NamespaceManager;
  beforeEach(() => { manager = new NamespaceManager(); });
  it('should create namespace', async () => {
    const ns = await manager.create({ name: 'team-a', labels: { team: 'a' } });
    expect(ns.name).toBe('team-a');
  });
  it('should delete namespace', async () => {
    await manager.create({ name: 'temp-ns' });
    await manager.delete('temp-ns');
    const exists = await manager.exists('temp-ns');
    expect(exists).toBe(false);
  });
  it('should list namespaces', async () => {
    await manager.create({ name: 'list-ns' });
    const namespaces = await manager.list();
    expect(namespaces.length).toBeGreaterThan(0);
  });
  it('should apply labels', async () => {
    await manager.create({ name: 'label-ns' });
    await manager.addLabels('label-ns', { env: 'prod' });
    const ns = await manager.get('label-ns');
    expect(ns.labels.env).toBe('prod');
  });
});