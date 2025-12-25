import { Ambassador } from '../../sidecar';

describe('Ambassador', () => {
  let ambassador: Ambassador;
  beforeEach(() => { ambassador = new Ambassador({ targetService: 'backend' }); });

  it('should proxy requests', async () => {
    const response = await ambassador.proxy({ path: '/api/users', method: 'GET' });
    expect(response).toBeDefined();
  });

  it('should apply rate limiting', async () => {
    for (let i = 0; i < 100; i++) { await ambassador.proxy({ path: '/api', method: 'GET' }).catch(() => {}); }
    const metrics = ambassador.getMetrics();
    expect(metrics.rateLimited).toBeGreaterThan(0);
  });
});
