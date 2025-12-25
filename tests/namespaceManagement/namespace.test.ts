import { NamespaceManager } from '../../namespaceManagement';
describe('NamespaceManager', () => {
  let manager: NamespaceManager;
  beforeEach(() => { manager = new NamespaceManager(); });
  it('should manage namespaces', async () => {
    await manager.create({ name: 'production', labels: { env: 'prod' } });
    expect((await manager.get('production'))?.name).toBe('production');
    expect((await manager.list()).length).toBe(1);
  });
});
