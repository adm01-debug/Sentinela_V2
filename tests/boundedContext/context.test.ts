import { BoundedContextManager, BoundedContext, ContextMap } from '../../boundedContext';
describe('BoundedContextManager', () => {
  let manager: BoundedContextManager;
  beforeEach(() => { manager = new BoundedContextManager(); });
  it('should define bounded context', () => {
    manager.define({
      name: 'Sales',
      description: 'Sales domain',
      modules: ['orders', 'customers', 'products']
    });
    const ctx = manager.get('Sales');
    expect(ctx.modules.length).toBe(3);
  });
  it('should map context relationships', () => {
    manager.define({ name: 'Sales', modules: [] });
    manager.define({ name: 'Inventory', modules: [] });
    manager.mapRelationship('Sales', 'Inventory', 'upstream-downstream');
    const relationships = manager.getRelationships('Sales');
    expect(relationships.length).toBe(1);
  });
  it('should list all contexts', () => {
    manager.define({ name: 'A', modules: [] });
    manager.define({ name: 'B', modules: [] });
    const contexts = manager.list();
    expect(contexts.length).toBe(2);
  });
});