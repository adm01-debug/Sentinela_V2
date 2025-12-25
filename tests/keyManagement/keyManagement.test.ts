import { KeyManager } from '../../keyManagement';
describe('KeyManager', () => {
  let manager: KeyManager;
  beforeEach(() => { manager = new KeyManager(); });
  it('should create keys', async () => {
    const id = await manager.create('aes-256');
    expect(id).toMatch(/^key_/);
    const key = await manager.get(id);
    expect(key).toBeDefined();
  });
  it('should rotate keys', async () => {
    const oldId = await manager.create('aes-256');
    const newId = await manager.rotate(oldId);
    expect(newId).not.toBe(oldId);
    expect(await manager.get(oldId)).toBeUndefined();
  });
});
