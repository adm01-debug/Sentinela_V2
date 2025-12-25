import { Operator } from '../../operators';
describe('Operator', () => {
  it('should watch resources', async () => {
    const op = new Operator({ kind: 'MyResource' });
    expect(op.isWatching()).toBeDefined();
  });
});
