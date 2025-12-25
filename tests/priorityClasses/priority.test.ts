import { PriorityClassManager } from '../../priorityClasses';

describe('PriorityClassManager', () => {
  it('should create priority class', async () => {
    const manager = new PriorityClassManager();
    const pc = await manager.create({ name: 'high-priority', value: 1000 });
    expect(pc.value).toBe(1000);
  });
});
