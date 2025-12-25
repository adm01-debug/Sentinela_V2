import { Operator } from '../../operators';
describe('Operator', () => {
  it('should watch resources', async () => {
    const op = new Operator({ kind: 'MyResource' });
    await op.start();
    expect(op.isWatching()).toBe(true);
    await op.stop();
    expect(op.isWatching()).toBe(false);
  });
});
