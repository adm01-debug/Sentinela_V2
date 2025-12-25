import { ConfigClient } from '../../configServer';

describe('ConfigClient', () => {
  let client: ConfigClient;
  beforeEach(() => { client = new ConfigClient({ url: 'http://localhost:8888' }); });

  it('should fetch config', async () => {
    const config = await client.get('app-name', 'production');
    expect(config).toBeDefined();
  });

  it('should watch for changes', async () => {
    const handler = jest.fn();
    client.watch('app-name', handler);
    expect(client.isWatching('app-name')).toBe(true);
  });
});
