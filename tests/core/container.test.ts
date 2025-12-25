import { Container } from '../../core/container';
describe('Container', () => {
  it('should resolve singletons', () => {
    const c = new Container();
    c.singleton('counter', () => ({ count: 0 }));
    const a = c.resolve('counter'); a.count++;
    expect(c.resolve('counter').count).toBe(1);
  });
});
