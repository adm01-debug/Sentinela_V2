import { MigrationManager, Migration, MigrationState } from '../../migrations';
describe('MigrationManager', () => {
  let manager: MigrationManager;
  beforeEach(() => { manager = new MigrationManager({ directory: './migrations' }); });
  it('should register migration', () => {
    manager.register({
      version: '001',
      name: 'create_users_table',
      up: async () => {},
      down: async () => {}
    });
    expect(manager.getPending().length).toBe(1);
  });
  it('should run migrations', async () => {
    const upFn = jest.fn();
    manager.register({ version: '001', name: 'test', up: upFn, down: async () => {} });
    await manager.up();
    expect(upFn).toHaveBeenCalled();
  });
  it('should rollback migrations', async () => {
    const downFn = jest.fn();
    manager.register({ version: '001', name: 'test', up: async () => {}, down: downFn });
    await manager.up();
    await manager.down();
    expect(downFn).toHaveBeenCalled();
  });
  it('should track migration state', async () => {
    manager.register({ version: '001', name: 'tracked', up: async () => {}, down: async () => {} });
    await manager.up();
    const state = await manager.getState();
    expect(state.applied).toContain('001');
  });
});