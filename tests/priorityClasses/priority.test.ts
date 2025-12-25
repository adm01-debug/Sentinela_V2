import { PriorityClassManager, PriorityClass } from '../../priorityClasses';
describe('PriorityClassManager', () => {
  let manager: PriorityClassManager;
  beforeEach(() => { manager = new PriorityClassManager(); });
  it('should create priority class', async () => {
    const pc = await manager.create({
      name: 'high-priority',
      value: 1000000,
      globalDefault: false,
      description: 'High priority workloads'
    });
    expect(pc.value).toBe(1000000);
  });
  it('should list priority classes', async () => {
    await manager.create({ name: 'p1', value: 100 });
    await manager.create({ name: 'p2', value: 200 });
    const classes = await manager.list();
    expect(classes.length).toBeGreaterThanOrEqual(2);
  });
  it('should get by name', async () => {
    await manager.create({ name: 'get-test', value: 500 });
    const pc = await manager.get('get-test');
    expect(pc.value).toBe(500);
  });
  it('should set global default', async () => {
    await manager.create({ name: 'default-pc', value: 0, globalDefault: true });
    const pc = await manager.get('default-pc');
    expect(pc.globalDefault).toBe(true);
  });
});