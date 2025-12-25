import { Config } from '../../core/config';
describe('Config', () => {
  it('should get and set values', () => {
    const config = new Config({ port: 3000, host: 'localhost' });
    expect(config.get('port')).toBe(3000);
    config.set('port', 8080);
    expect(config.get('port')).toBe(8080);
  });
  it('should merge overrides', () => {
    const config = new Config({ a: 1, b: 2 });
    config.merge({ b: 3 });
    expect(config.all()).toEqual({ a: 1, b: 3 });
  });
});
