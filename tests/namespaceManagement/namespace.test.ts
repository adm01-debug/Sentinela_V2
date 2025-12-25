import { NamespaceManager } from '../../namespaceManagement';

describe('NamespaceManager', () => {
  let manager: NamespaceManager;
  beforeEach(() => { manager = new NamespaceManager(); });

  it('should create namespace', async () => {
    const ns = await manager.create({ name: 'dev', labels: { env: 'development' } });
    expect(ns.name).toBe('dev');
  });
});
