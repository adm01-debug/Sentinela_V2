import { ConfigServer, ConfigSource, ConfigWatcher } from '../../configServer';
describe('ConfigServer', () => {
  let server: ConfigServer;
  beforeEach(() => { server = new ConfigServer(); });
  it('should get config', async () => {
    await server.set('app.name', 'MyApp');
    const value = await server.get('app.name');
    expect(value).toBe('MyApp');
  });
  it('should get nested config', async () => {
    await server.set('database', { host: 'localhost', port: 5432 });
    const config = await server.get('database');
    expect(config.host).toBe('localhost');
  });
  it('should watch for changes', (done) => {
    server.watch('watched.key', (newVal) => {
      expect(newVal).toBe('changed');
      done();
    });
    server.set('watched.key', 'changed');
  });
  it('should merge configs', async () => {
    await server.set('base', { a: 1, b: 2 });
    await server.merge('base', { b: 3, c: 4 });
    const config = await server.get('base');
    expect(config).toEqual({ a: 1, b: 3, c: 4 });
  });
});