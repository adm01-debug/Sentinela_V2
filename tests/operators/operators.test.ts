import { OperatorManager, Operator, ReconcileResult } from '../../operators';
describe('OperatorManager', () => {
  let manager: OperatorManager;
  beforeEach(() => { manager = new OperatorManager(); });
  it('should register operator', () => {
    manager.register({
      name: 'database-operator',
      watchKinds: ['Database'],
      reconcile: async (resource) => ({ requeue: false })
    });
    const operators = manager.list();
    expect(operators).toContain('database-operator');
  });
  it('should reconcile resource', async () => {
    const reconcileFn = jest.fn().mockResolvedValue({ requeue: false });
    manager.register({
      name: 'test-operator',
      watchKinds: ['Test'],
      reconcile: reconcileFn
    });
    await manager.triggerReconcile('test-operator', { kind: 'Test', metadata: { name: 'r1' } });
    expect(reconcileFn).toHaveBeenCalled();
  });
  it('should handle requeue', async () => {
    manager.register({
      name: 'requeue-operator',
      watchKinds: ['Requeue'],
      reconcile: async () => ({ requeue: true, requeueAfter: 5000 })
    });
    const result = await manager.triggerReconcile('requeue-operator', { kind: 'Requeue', metadata: { name: 'r1' } });
    expect(result.requeue).toBe(true);
  });
});