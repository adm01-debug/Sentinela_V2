import { OperatorFramework } from '../../operators';
describe('OperatorFramework', () => {
  it('should register operator', () => {
    const framework = new OperatorFramework();
    framework.register({ name: 'my-operator', reconcile: async () => {} });
    expect(framework.hasOperator('my-operator')).toBe(true);
  });
});
