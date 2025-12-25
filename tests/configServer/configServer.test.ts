import { ConfigClient } from '../../configServer';
describe('ConfigClient', () => {
  let client: ConfigClient;
  beforeEach(() => { client = new ConfigClient({ endpoint: 'http://config.local' }); });
  it('should get and set config', async () => {
    await client.set('app.name', 'Sentinela');
    expect(await client.get('app.name')).toBe('Sentinela');
  });
});
